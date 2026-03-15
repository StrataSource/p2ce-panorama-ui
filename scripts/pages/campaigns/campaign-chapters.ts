'use strict';

class ChapterEntry {
	num: number;
	panel: Panel;
	chapter: VirtualChapter | undefined;
	button: RadioButton | undefined;
	playPanel: Panel | undefined;
	unlocked: boolean;

	constructor(num: number, panel: Panel, chapter: ChapterInfo | undefined, unlocked: boolean) {
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
			installImageFallbackHandler(cover);
			const thumb = getChapterThumbnail(CampaignAPI.GetActiveCampaign()!, this.chapter);
			cover.SetImage(thumb);
		}

		let activationFn = () => {};

		if (CampaignChapters.displayMode === ChapterDisplayMode.LIST) {
			activationFn = () => {
				if (!this.unlocked) return;

				if (chTitleSplit.length === 2) {
					CampaignChapters.chapterListModeHeader.visible = true;
					CampaignChapters.chapterListModeHeader.text = chTitleSplit[0];
					CampaignChapters.chapterListModeTitle.text = chTitleSplit[1];
				} else {
					CampaignChapters.chapterListModeHeader.visible = false;
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
		} else if (
			CampaignChapters.displayMode === ChapterDisplayMode.GRID ||
			CampaignChapters.displayMode === ChapterDisplayMode.SQUARE_GRID
		) {
			//activationFn = () => {
			//	UiToolkitAPI.ShowGenericPopupThreeOptions(
			//		'[HC] Choose',
			//		'[HC] Customize game settings before starting?',
			//		'blur',
			//		'[HC] Start',
			//		() => { CampaignChapters.startChapter() },
			//		'[HC] Customize',
			//		() => { CampaignChapters.customizeChapter() },
			//		'[HC] Go Back',
			//		() => { }
			//	);
			//}
		}

		if (!this.unlocked) {
			this.panel.enabled = false;
		} else {
			this.button = this.panel.FindChildTraverse<RadioButton>('ChapterBtn')!;
			this.playPanel = this.panel.FindChildTraverse<Panel>('ChapterPlayPanel')!;
			this.playPanel.FindChildTraverse<Button>('PlayBtn')!.SetPanelEvent('onactivate', () => {
				CampaignChapters.startChapter();
			});
			this.playPanel.FindChildTraverse<Button>('CustomizeBtn')!.SetPanelEvent('onactivate', () => {
				CampaignChapters.customizeChapter();
			});
			this.playPanel.enabled = false;

			if (CampaignChapters.displayMode === ChapterDisplayMode.SUPER) {
				this.button.hittest = false;
				this.button.hittestchildren = false;
			}

			this.button.SetPanelEvent('onactivate', () => {
				//CampaignChapters.actions.enabled = true;
				//UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] = this.chapter;
				if (CampaignChapters.selectedBtn && CampaignChapters.selectedBtn.button?.IsValid()) {
					CampaignChapters.selectedBtn.deselect();
				}
				CampaignChapters.selectedBtn = this;
				CampaignChapters.selectedChapter = this.chapter!;

				this.showPlayPanel();

				activationFn();
			});
		}
	}

	showPlayPanel() {
		this.playPanel!.style.height = '64px';
		this.playPanel!.enabled = true;
	}

	deselect() {
		this.playPanel!.enabled = false;
		this.playPanel!.style.height = '0px';
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
	static chapterListModeHeader = $<Label>('#ChapterListHeader')!;

	static chapterEntries: ChapterEntry[] = [];
	static selectedChapter: VirtualChapter | undefined = undefined;
	static campaign = CampaignAPI.GetActiveCampaign()!;
	static chapterPage = 0;
	static maxPages = -1;
	static maxEntryPerPage = 3;
	static displayMode: ChapterDisplayMode | string = ChapterDisplayMode.LIST;
	static chapterCache: VirtualChapter[] = [];
	static selectedBtn: ChapterEntry | undefined = undefined;

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
			const buckets = CampaignAPI.GetAllCampaignBuckets().filter((v: CampaignBucket) => {
				return isBucketSingleWsCampaign(v);
			});

			this.chapterCache = [];

			for (const bucket of buckets) {
				const addon = WorkshopAPI.GetAddonMeta(bucket.addon_id);
				if (addon.type !== 'Map') {
					continue;
				}
				for (const campaign of bucket.campaigns) {
					// assuming the system isn't gaslighting us
					// an autogen'd campaign should have 1 chapter with at least 1 map
					// i dont really care if it has multiple maps
					// you really should make a campaign if you have multiple maps
					// it's just BETTER!
					const fakeMap = new VirtualMap(campaign.chapters[0].maps[0].name);
					const fakeCh = new VirtualChapter(
						`${bucket.id}/${campaign.id}`,
						campaign.title,
						[fakeMap],
						addon.thumb
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
			const panel = this.list.Children()[0];
			const btn = panel.FindChildTraverse<RadioButton>('ChapterBtn')!;
			btn.SetFocus();

			$.DispatchEvent('Activated', btn, PanelEventSource.PROGRAM);
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
				: i <
					Math.min(this.maxEntryPerPage, this.chapterCache.length - this.chapterPage * this.maxEntryPerPage);
			++i
		) {
			const p = $.CreatePanel('Panel', this.list, 'chapter' + i);
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			const idx = this.chapterPage * this.maxEntryPerPage + i;
			const ch = idx < this.chapterCache.length ? this.chapterCache[idx] : undefined;

			this.chapterEntries.push(new ChapterEntry(idx, p, ch, isSingleWsCampaign || prog >= idx));

			this.chapterEntries[i].update();
		}

		if (this.displayMode === ChapterDisplayMode.SUPER && this.chapterEntries.length > 0) {
			const entry = this.chapterEntries[0];
			$.DispatchEvent('Activated', entry.button!, PanelEventSource.PROGRAM);
		}

		for (const entry of this.chapterEntries) {
			if (this.selectedChapter && entry.chapter && this.selectedChapter.id === entry.chapter.id) {
				$.DispatchEvent('Activated', entry.button!, PanelEventSource.PROGRAM);
			}
		}
	}

	static startChapter() {
		$.DispatchEvent('MainMenuSwitchFade', true, true);

		let campaignId: string;
		let chapterId: string;
		if (this.selectedChapter!.type === CampaignDataType.P2CE_SINGLE_WS_SPECIAL) {
			campaignId = this.selectedChapter!.id;
			chapterId = 'auto';
		} else {
			campaignId = `${CampaignChapters.campaign.bucket.id}/${CampaignChapters.campaign.campaign.id}`;
			chapterId = this.selectedChapter!.id;
		}

		$.Schedule(0.1, () => {
			$.DispatchEvent('LoadingScreenClearLastMap');
			CampaignAPI.StartCampaign(campaignId, chapterId, 0);
		});
	}

	static customizeChapter() {
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] = this.selectedChapter;
		$.DispatchEvent('MainMenuOpenNestedPage', 'CampaignCustomization', 'campaigns/campaign-settings', undefined);
	}
}
