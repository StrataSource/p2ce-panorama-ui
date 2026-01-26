'use strict';

class ChapterEntry {
	num: number;
	panel: Button;
	chapter: ChapterInfo;
	locked: boolean;

	constructor(num: number, panel: Button, chapter: ChapterInfo, locked: boolean) {
		this.num = num;
		this.panel = panel;
		this.chapter = chapter;
		this.locked = locked;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('ChapterTitle');
		const desc = this.panel.FindChildTraverse<Label>('ChapterDesc');
		const cover = this.panel.FindChildTraverse<Image>('ChapterCover');

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
			if (this.locked) desc.text = '????';
			else if (chTitleSplit.length === 2) {
				desc.text = chTitleSplit[1];
			} else {
				desc.text = chTitleSplit[0];
			}
		}
		if (cover) {
			const thumb = this.chapter.meta[CampaignMeta.CHAPTER_THUMBNAIL];
			if (thumb) {
				if ((thumb as string).startsWith('http')) {
					cover.SetImage(thumb);
				} else {
					cover.SetImage(`${getCampaignAssetPath(CampaignAPI.GetActiveCampaign()!)}${thumb}`);
				}
			}
			else cover.SetImage(getRandomFallbackImage());
		}

		if (this.locked) {
			this.panel.enabled = false;
		} else {
			this.panel.SetPanelEvent('onactivate', () => {
				//CampaignChapters.actions.enabled = true;
				CampaignChapters.selectedChapter = this.chapter;
				UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] = this.chapter;
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'CampaignCustomization',
					'campaigns/campaign-settings',
					undefined
				);
			});
		}

		if (CampaignChapters.displayMode === ChapterDisplayMode.LIST) {
			const setBigImage = () => {
				if (this.locked) return;

				if (chTitleSplit.length === 2) {
					CampaignChapters.chapterListModeTitle.text = chTitleSplit[1];
				} else {
					CampaignChapters.chapterListModeTitle.text = chTitleSplit[0];
				}

				const thumb = this.chapter.meta[CampaignMeta.CHAPTER_THUMBNAIL];
				if (thumb) {
					if ((thumb as string).startsWith('http')) {
						CampaignChapters.chapterListModeCover.SetImage(thumb);
					} else {
						CampaignChapters.chapterListModeCover.SetImage(`${getCampaignAssetPath(CampaignAPI.GetActiveCampaign()!)}${thumb}`);
					}
				}
				else CampaignChapters.chapterListModeCover.SetImage(getRandomFallbackImage());
			};

			this.panel.SetPanelEvent('onmouseover', () => { setBigImage(); });
			this.panel.SetPanelEvent('onfocus', () => { setBigImage(); });
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
	static displayMode = ChapterDisplayMode.CLASSIC;

	static {
		$.RegisterForUnhandledEvent('LayoutReloaded', () => {
			this.init();
		});
	}

	static init() {
		this.displayMode = this.campaign.meta[CampaignMeta.CHAPTER_DISPLAY_MODE];

		if (!this.displayMode) this.displayMode = ChapterDisplayMode.CLASSIC;

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

		if (this.maxPages === -1) this.maxPages = Math.ceil(this.campaign.chapters.length / this.maxEntryPerPage);

		if (this.maxPages === 1) {
			this.nav.visible = false;
		}

		$.Msg(`Pages: ${this.chapterPage}/${this.maxPages}`);

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
			const pip = $.CreatePanel(
				'RadioButton',
				this.pips,
				`Pip${i}`,
				{
					'group': 'ChaptersPipGroup',
					'tabindex': 'auto',
					'selectionpos': 'auto'
				}
			);
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
		(this.pips.Children()[this.chapterPage] as RadioButton).SetSelected(true);
		
		if (this.displayMode === ChapterDisplayMode.GRID) {
			this.counterLabel.text = `${this.chapterPage + 1}\n/\n${this.maxPages}`
		} else {
			this.counterLabel.text = `${this.chapterPage + 1} / ${this.maxPages}`;
		}

		const prog = CampaignAPI.GetCampaignUnlockProgress(this.campaign.id);
		const chapters = this.campaign.chapters;
		this.list.RemoveAndDeleteChildren();
		this.chapterEntries = [];

		for (
			let i = 0;
			i < Math.min(this.maxEntryPerPage, chapters.length - this.chapterPage * this.maxEntryPerPage);
			++i
		) {
			const p = $.CreatePanel('Button', this.list, 'chapter' + i);
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			const idx = this.chapterPage * this.maxEntryPerPage + i;

			this.chapterEntries.push(new ChapterEntry(idx, p, chapters[idx], prog < idx));

			this.chapterEntries[i].update();
		}
	}

	static startChapter() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
			$.DispatchEvent('MainMenuCloseAllPages');
			$.Schedule(0.001, () => CampaignAPI.StartCampaign(this.campaign.id, this.selectedChapter.id));
		} else {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_NewGame_Title'),
				$.Localize('#Action_NewGame_Description'),
				'warning-popup',
				$.Localize('#UI_Yes'),
				() => {
					$.DispatchEvent('MainMenuCloseAllPages');
					$.Schedule(0.001, () => CampaignAPI.StartCampaign(this.campaign.id, this.selectedChapter.id));
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		}
	}

	static customizeChapter() {
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] = this.selectedChapter;
		$.DispatchEvent('MainMenuOpenNestedPage', 'CampaignCustomization', 'campaigns/campaign-settings', undefined);
		//CampaignMgr.customizeChapter(this.selectedChapter);
	}
}
