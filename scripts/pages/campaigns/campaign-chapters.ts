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
			CampaignChaptersTab.selectedChapter = this.chapter;
			CampaignChaptersTab.starterPanel.enabled = true;
		});
	}
}

class CampaignChaptersTab {
	static campaignControls = $<Panel>('#CampaignControls')!;
	static campaignListerContainer = $<Panel>('#CampaignListerContainer')!;
	static campaignLister = $<Panel>('#CampaignLister')!;
	static tabLabel = $<Label>('#CampaignListerModeLabel')!;
	static chapterEntries: ChapterEntry[] = [];
	static starterPanel = $<Panel>('#CampaignStarterPanel')!;
	static selectedChapter: ChapterInfo;

	static setActive() {
		CampaignSavesTab.close();
		this.purgeChapterList();
		this.populateChapters();
		this.show();
	}

	static close() {
		this.starterPanel.visible = false;
		this.purgeChapterList();
	}

	static show() {
		this.starterPanel.enabled = false;
		this.starterPanel.visible = true;
		this.campaignControls.visible = false;
		this.campaignListerContainer.visible = true;
		this.tabLabel.text = $.Localize('#MainMenu_Campaigns_MM_NewGame');
	}

	static purgeChapterList() {
		while (this.chapterEntries.length > 0) this.chapterEntries.pop()?.panel.DeleteAsync(0);
	}

	static populateChapters() {
		const chapters = CampaignMgr.currentCampaign!.chapters;

		for (let i = 0; i < chapters.length; ++i) {
			const p = $.CreatePanel('RadioButton', this.campaignLister, 'chapter' + i, {
				class: i !== chapters.length - 1 ? 'chapters__entry__lined' : ''
			});
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			this.chapterEntries.push(new ChapterEntry(i, p, chapters[i], false));
			this.chapterEntries[i].update();
		}
	}

	static startChapter() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
			CampaignMgr.selectChapter(this.selectedChapter);
			CampaignMgr.startGame();
		} else {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_NewGame_Title'),
				$.Localize('#Action_NewGame_Description'),
				'warning-popup',
				$.Localize('#UI_Yes'),
				() => {
					CampaignMgr.selectChapter(this.selectedChapter);
					CampaignMgr.startGame();
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		}
	}

	static customizeChapter() {
		CampaignMgr.customizeChapter(this.selectedChapter);
	}
}
