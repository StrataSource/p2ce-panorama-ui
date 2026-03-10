'use strict';

class ChapterEntry {
	num: number;
	panel: Button;
	chapter: VirtualChapter | undefined;
	unlocked: boolean;

	constructor(num: number, panel: Button, chapter: ChapterInfo | undefined, unlocked: boolean) {
		this.num = num;
		this.panel = panel;
		this.chapter = chapter;
		this.unlocked = unlocked;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('ChapterTitle');
		const desc = this.panel.FindChildTraverse<Label>('ChapterDesc');
		const cover = this.panel.FindChildTraverse<Image>('ChapterCover');

		if (this.chapter === undefined) {
			if (title) title.style.opacity = 0;
			if (desc) desc.style.opacity = 0;
			if (cover) cover.style.opacity = 0;
			this.panel.enabled = false;
			return;
		}

		$.RegisterEventHandler('ImageFailedLoad', this.panel, () => {
			const c = this.panel.FindChildTraverse<Image>('ChapterCover');
			// defaultsrc attribute is unreliable
			$.Warning('CAMPAIGN CHAPTERS: Could not load chapter image');
			c?.SetImage(getRandomFallbackImage());
		});

		const chTitleSplit = $.Localize(this.chapter.title).split('\n');

		if (title) {
			if (chTitleSplit.length === 2) {
				title.text = chTitleSplit[0];
			} else {
				title.visible = false;
			}
		}
		if (desc) {
			if (!this.unlocked) desc.text = '????';
			else if (chTitleSplit.length === 2) {
				desc.text = chTitleSplit[1];
			} else {
				desc.text = chTitleSplit[0];
			}
		}
		if (cover) {
			const thumb = getChapterThumbnail(
				CampaignAPI.GetActiveCampaign()!,
				this.chapter
			);
			cover.SetImage(thumb);
		}

		if (!this.unlocked) {
			this.panel.enabled = false;
		} else {
			this.panel.SetPanelEvent('onactivate', () => {
				//CampaignChapters.actions.enabled = true;
				CampaignChapters.selectedChapter = this.chapter!;
				UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] = this.chapter;
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'CampaignCustomization',
					'campaigns/campaign-settings',
					this.panel
				);
			});
		}

		if (CampaignChapters.displayMode === ChapterDisplayMode.LIST) {
			const setBigImage = () => {
				if (!this.unlocked) return;

				if (chTitleSplit.length === 2) {
					CampaignChapters.chapterListModeTitle.text = chTitleSplit[1];
				} else {
					CampaignChapters.chapterListModeTitle.text = chTitleSplit[0];
				}

				const thumb = this.chapter!.meta.get(CampaignMeta.CHAPTER_THUMBNAIL);
				if (thumb) {
					if ((thumb as string).startsWith('http')) {
						CampaignChapters.chapterListModeCover.SetImage(thumb);
					} else {
						CampaignChapters.chapterListModeCover.SetImage(
							`${getCampaignAssetPath(CampaignAPI.GetActiveCampaign()!)}${thumb}`
						);
					}
				} else CampaignChapters.chapterListModeCover.SetImage(getRandomFallbackImage());
			};

			this.panel.SetPanelEvent('onmouseover', () => {
				setBigImage();
			});
			this.panel.SetPanelEvent('onfocus', () => {
				setBigImage();
			});
		}
	}
}

class CampaignChapters {
	static list = $<Panel>('#CampaignChapters')!;
	static listWrapper = $<Panel>('#CampaignChaptersWrap')!;
	static actions = $<Panel>('#CampaignStarterPanel')!;
	static container = $<Panel>('#ChaptersContainer')!;
	static counterLabel = $<Label>('#PageCounter')!;
	static nav = $<Panel>('#ChaptersNav')!;
	static navControls = $<Panel>('#NavControls')!;
	static pips = $<Panel>('#ChaptersPips')!;
	static chapterListModeCover = $<Image>('#ChapterListCover')!;
	static chapterListModeTitle = $<Label>('#ChapterListTitle')!;

	static chapterEntries: ChapterEntry[] = [];
	static selectedChapter: ChapterInfo;
	static campaign = CampaignAPI.GetActiveCampaign()!;
	static chapterPage = 0;
	static maxPages = -1;
	static maxEntryPerPage = 3;
	static displayMode: ChapterDisplayMode | string = ChapterDisplayMode.LIST;
	static chapterCache: VirtualChapter[] = [];

	static {
		$.RegisterForUnhandledEvent('LayoutReloaded', () => {
			this.init();
		});
	}

	static init() {
		const isSingleWsCampaign = isSpecialSingleWsCampaign(this.campaign);
		if (isSingleWsCampaign) {
			this.displayMode = ChapterDisplayMode.SQUARE_GRID;
		} else {
			this.displayMode = CampaignAPI.GetCampaignMeta(null).get(CampaignMeta.CHAPTER_DISPLAY_MODE) ?? '';
			if (!this.displayMode) this.displayMode = ChapterDisplayMode.LIST;
		}

		switch (this.displayMode) {
			case ChapterDisplayMode.LIST:
				$.GetContextPanel().AddClass('ChapterModeList');
				this.maxEntryPerPage = 1000000;
				this.list.AddClass('chapters__list');
				break;

			case ChapterDisplayMode.GRID:
				$.GetContextPanel().AddClass('ChapterModeGrid');
				this.maxEntryPerPage = 100;
				this.list.AddClass('chapters__grid');
				break;

			case ChapterDisplayMode.SQUARE_GRID:
				$.GetContextPanel().AddClass('ChapterModeSquareGrid');
				this.maxEntryPerPage = 100;
				this.list.AddClass('chapters__square-grid');
				break;

			case ChapterDisplayMode.CLASSIC:
				$.GetContextPanel().AddClass('ChapterModeClassic');
				this.maxEntryPerPage = 3;
				this.list.AddClass('chapters__classic');
				break;

			case ChapterDisplayMode.SUPER:
				$.GetContextPanel().AddClass('ChapterModeSuper');
				this.maxEntryPerPage = 1;
				this.list.AddClass('chapters__super');
				break;
		}

		if (isSingleWsCampaign) {
			const buckets = CampaignAPI.GetAllCampaignBuckets().filter((v: CampaignBucket) => { return isBucketSingleWsCampaign(v) });

			this.chapterCache = [];

			for (const bucket of buckets) {
				for (const campaign of bucket.campaigns) {
					// assuming the system isn't gaslighting us
					// an autogen'd campaign should have 1 chapter with at least 1 map
					// i dont really care if it has multiple maps
					// you really should make a campaign if you have multiple maps
					// it's just BETTER!
					const addon = WorkshopAPI.GetAddonMeta(bucket.addon_id).thumb;
					const fakeMap = new VirtualMap(campaign.chapters[0].maps[0].name);
					const fakeCh = new VirtualChapter(
						`${bucket.id}/${campaign.id}`,
						campaign.title,
						[fakeMap],
						addon
					);

					this.chapterCache.push(fakeCh);
				}
			}
		} else {
			this.chapterCache = this.campaign.campaign.chapters;
		}

		if (this.maxPages === -1) this.maxPages = Math.ceil(this.chapterCache.length / this.maxEntryPerPage);

		if (this.maxPages === 1) {
			this.nav.visible = false;
		}

		$.Msg(`CHAPTER SCREEN: Pages: ${this.chapterPage}/${this.maxPages}`);

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Campaigns_MM_Start_Title'),
			$.Localize('#MainMenu_Campaigns_MM_Start_Tagline')
		);

		this.populatePips();
		this.populateChapters();

		if (this.list.GetChildCount() > 0) {
			this.list.Children()[0].SetFocus();
		}
	}

	static populatePips() {
		for (let i = 0; i < this.maxPages; ++i) {
			const pip = $.CreatePanel('RadioButton', this.pips, `Pip${i}`, {
				group: 'ChaptersPipGroup',
				tabindex: 'auto',
				selectionpos: 'auto'
			});
			pip.AddClass('chapters__nav__pips__entry');
			pip.SetPanelEvent('onactivate', () => {
				this.chapterPage = i;
				this.populateChapters();
			});
		}
	}

	static backPage() {
		this.chapterPage -= 1;
		if (this.chapterPage < 0) this.chapterPage = this.maxPages - 1;
		this.populateChapters();
	}

	static forwardPage() {
		this.chapterPage += 1;
		if (this.chapterPage >= this.maxPages) this.chapterPage = 0;
		this.populateChapters();
	}

	static populateChapters() {
		if (this.pips.Children().length > 0) (this.pips.Children()[this.chapterPage] as RadioButton).SetSelected(true);

		if (this.displayMode === ChapterDisplayMode.GRID) {
			this.counterLabel.text = `${this.chapterPage + 1}\n/\n${this.maxPages}`;
		} else {
			this.counterLabel.text = `${this.chapterPage + 1} / ${this.maxPages}`;
		}

		const prog = CampaignAPI.GetCampaignUnlockProgress(`${this.campaign.bucket.id}/${this.campaign.campaign.id}`);
		const isSingleWsCampaign = isSpecialSingleWsCampaign(this.campaign);
		
		this.list.RemoveAndDeleteChildren();
		this.chapterEntries = [];

		for (
			let i = 0;
			this.displayMode === ChapterDisplayMode.CLASSIC
				? i < this.maxEntryPerPage
				: i < Math.min(this.maxEntryPerPage, this.chapterCache.length - this.chapterPage * this.maxEntryPerPage);
			++i
		) {
			const p = $.CreatePanel('Button', this.list, 'chapter' + i);
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			const idx = this.chapterPage * this.maxEntryPerPage + i;

			this.chapterEntries.push(
				new ChapterEntry(
					idx,
					p,
					idx < this.chapterCache.length ? this.chapterCache[idx] : undefined,
					isSingleWsCampaign || prog >= idx
				)
			);

			this.chapterEntries[i].update();
		}
	}

	static customizeChapter() {
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] = this.selectedChapter;
		$.DispatchEvent('MainMenuOpenNestedPage', 'CampaignCustomization', 'campaigns/campaign-settings', undefined);
		//CampaignMgr.customizeChapter(this.selectedChapter);
	}
}
