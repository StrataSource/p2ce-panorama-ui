'use strict';

const CHAPTER_PAGE_ENTRIES = 3;

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
			c?.SetImage('file://{images}/menu/p2ce-generic.png');
		});

		if (title) {
			this.panel.SetDialogVariableInt('chapter_num', this.num + 1);
			//title.text = tagDevString(`Chapter ${this.num + 1}`);
		}
		if (desc) {
			if (this.locked) desc.text = '????';
			else desc.text = $.Localize(this.chapter.title);
		}
		if (cover) {
			if (this.chapter.thumbnail.endsWith('.vtf') || this.chapter.thumbnail.endsWith('.png') || this.chapter.thumbnail.endsWith('.jpg'))
				cover.SetImage(`file://${this.chapter.thumbnail}`);
			else
				cover.SetImage(this.chapter.thumbnail);
		}

		if (this.locked) {
			this.panel.enabled = false;
		} else {
			this.panel.SetPanelEvent('onactivate', () => {
				//CampaignChapters.actions.enabled = true;
				CampaignChapters.selectedChapter = this.chapter;
				UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] = this.chapter;
				$.DispatchEvent('MainMenuOpenNestedPage', 'CampaignCustomization', 'campaigns/campaign-settings');
			});
		}
	}
}

class CampaignChapters {
	static list = $<Panel>('#CampaignChapters')!;
	static actions = $<Panel>('#CampaignStarterPanel')!;

	static chapterEntries: ChapterEntry[] = [];
	static selectedChapter: ChapterInfo;
	static campaign: CampaignInfo = UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] as CampaignInfo;
	static chapterPage = 0;
	static maxPages = -1;

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
		if (this.maxPages === -1)
			this.maxPages = Math.ceil(this.campaign.chapters.length / CHAPTER_PAGE_ENTRIES);

		$.Msg(`Pages: ${this.chapterPage}/${this.maxPages}`);

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Campaigns_MM_Start_Title'),
			$.Localize('#MainMenu_Campaigns_MM_Start_Tagline')
		);

		const chapters = this.campaign.chapters;
		const prog = CampaignAPI.GetCampaignUnlockProgress(this.campaign.id);
		$.Msg(`Campaign progress: ${prog}`);

		this.list.RemoveAndDeleteChildren();
		this.chapterEntries = [];

		for (
			let i = 0;
			i < Math.min(
				CHAPTER_PAGE_ENTRIES,
				chapters.length - (this.chapterPage * CHAPTER_PAGE_ENTRIES)
			);
			++i
		) {
			const p = $.CreatePanel('Button', this.list, 'chapter' + i);
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			const idx = (this.chapterPage * CHAPTER_PAGE_ENTRIES) + i;

			this.chapterEntries.push(
				new ChapterEntry(
					idx,
					p,
					chapters[idx],
					prog < idx
				)
			);

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
		$.DispatchEvent('MainMenuOpenNestedPage', 'CampaignCustomization', 'campaigns/campaign-settings');
		//CampaignMgr.customizeChapter(this.selectedChapter);
	}
}
