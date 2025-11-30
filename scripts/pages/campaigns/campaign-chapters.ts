'use strict';

class ChapterEntry {
	index: number;
	panel: RadioButton;
	chapter: ChapterInfo;
	locked: boolean;

	constructor(index: number, panel: RadioButton, chapter: ChapterInfo, locked: boolean) {
		this.index = index;
		this.panel = panel;
		this.chapter = chapter;
		this.locked = locked;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('ChapterTitle');
		const desc = this.panel.FindChildTraverse<Label>('ChapterDesc');
		const cover = this.panel.FindChildTraverse<Image>('ChapterCover');

		if (title) {
			title.text = tagDevString(`Chapter ${this.index + 1}`);
		}
		if (desc) {
			desc.text = $.Localize(this.chapter.title);
		}
		if (cover) {
			cover.SetImage(`file://{materials}/${this.chapter.thumbnail}.vtf`);
		}

		this.panel.SetPanelEvent('onactivate', () => {
			CampaignChapters.selectedChapter = this.chapter;
			CampaignChapters.actions.enabled = true;
		});
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

		for (let i = 0; i < chapters.length; ++i) {
			const p = $.CreatePanel('RadioButton', this.list, 'chapter' + i);
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			this.chapterEntries.push(new ChapterEntry(i, p, chapters[i], false));
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
		UiToolkitAPI.ShowGenericPopupOk(
			'[DEV] Not Available',
			'This is still being rewritten.',
			'generic-popup',
			() => {}
		);
		//CampaignMgr.customizeChapter(this.selectedChapter);
	}
}
