'use strict';

class ChapterEntry {
	index: number;
	panel: Button;
	chapter: ChapterInfo;
	locked: boolean;

	constructor(index: number, panel: Button, chapter: ChapterInfo, locked: boolean) {
		this.index = index;
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
			title.text = tagDevString(`Chapter ${this.index + 1}`);
		}
		if (desc) {
			if (this.locked) desc.text = '????';
			else desc.text = $.Localize(this.chapter.title);
		}
		if (cover) {
			cover.SetImage(`file://${this.chapter.thumbnail}`);
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

	static populateChapters() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			tagDevString('Chapter Select'),
			tagDevString('Configure & Start a New Game')
		);

		const chapters = this.campaign.chapters;
		const prog = CampaignAPI.GetCampaignUnlockProgress(this.campaign.id);
		$.Msg(`Campaign progress: ${prog}`);

		for (let i = 0; i < chapters.length; ++i) {
			const p = $.CreatePanel('Button', this.list, 'chapter' + i);
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			this.chapterEntries.push(new ChapterEntry(i, p, chapters[i], prog < i));
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
