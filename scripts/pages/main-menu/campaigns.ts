'use strict';

class CampaignEntry {
	index: number;
	panel: Panel;
	info: CampaignInfo;

	constructor(index: number, panel: Panel, info: CampaignInfo) {
		this.index = index;
		this.panel = panel;
		this.info = info;
	}

	update() {
		const title = this.panel.FindChildTraverse('CampaignTitle') as Label;
		title.text = $.Localize(this.info.title);

		this.panel.SetPanelEvent('onactivate', () => CampaignMgr.campaignSelected(this.info));
	}
}

class ChapterEntry {
	index: number;
	panel: Panel;
	info: ChapterInfo;
	locked: boolean;

	constructor(index: number, panel: Panel, info: ChapterInfo, locked: boolean) {
		this.index = index;
		this.panel = panel;
		this.info = info;
		this.locked = locked;
	}

	update() {
		const title = this.panel.FindChildTraverse('ChapterTitle') as Label;
		title.text = $.Localize(this.info.title);

		const image = this.panel.FindChildTraverse('ChapterCover') as Image;
		
		if(!this.locked) {
			image.SetImage(this.info.thumbnail.length > 0 ? 'file://{materials}/' + this.info.thumbnail + '.vtf' : 'file://{images}/menu/missing-cover.png');
			
			this.panel.SetPanelEvent('onactivate', () => CampaignMgr.startGame(this.info.id));
		}
		else
		{
			image.SetImage('file://{materials}/vgui/no_save_game.vtf');
		}
	}
}

class CampaignNewGamePage {
	static chapterContainer = $<Panel>('#ChapterContainer');
	static chapterEntries: ChapterEntry[] = [];

	static init() {
		if (!this.chapterContainer) return;

		this.chapterContainer.visible = false;
	}

	static setActive() {
		if (!this.chapterContainer) return;
		
		this.purgeChapterList();
		if(CampaignMgr.currentCampaign) {
			this.createChapterEntries(CampaignMgr.currentCampaign);
		}
		this.chapterContainer.visible = true;
	}

	static hide() {
		if (!this.chapterContainer) return;

		this.purgeChapterList();
		this.chapterContainer.visible = false;
	}

	static purgeChapterList() {
		while (this.chapterEntries.length > 0) this.chapterEntries.pop()?.panel.DeleteAsync(0);
	}

	static createChapterEntries(info: CampaignInfo) {
		if (!this.chapterContainer) return;

		const progress = CampaignAPI.GetCampaignUnlockProgress(info.id);

		for (let i = 0; i < info.chapters.length; ++i) {

			const panel = $.CreatePanel('Panel', this.chapterContainer, 'chapter' + i);
			panel.LoadLayoutSnippet('ChapterEntrySnippet');

			const locked = i > progress;

			this.chapterEntries.push(new ChapterEntry(i, panel, info.chapters[i], locked));
		}

		for (const chapter of this.chapterEntries) {
			chapter.update();
		}
	}
}

class CampaignStartPage {
	static campaignStartPage = $<Panel>('#CampaignStartPage');
	static campaignActiveLogo = $<Image>('#CampaignActiveLogo');
	static campaignActiveTitle = $<Label>('#CampaignActiveTitle');

	static init() {
		this.hide();
	}

	static setActive() {
		if (!this.campaignStartPage || !this.campaignActiveLogo || !this.campaignActiveTitle || !CampaignMgr.currentCampaign) return;

		// TODO: Improve logo handling!
		this.campaignActiveTitle.text = $.Localize(CampaignMgr.currentCampaign.title);
		this.campaignActiveTitle.visible = true;
		
		this.campaignStartPage.visible = true;
	}

	static hide() {
		if (!this.campaignStartPage || !this.campaignActiveLogo || !this.campaignActiveTitle) return;

		this.campaignStartPage.visible = false;
		this.campaignActiveLogo.visible = false;
		this.campaignActiveTitle.visible = false;
	}

	static onContinue() {
		
	}

	static onNewGame() {
		this.hide();
		CampaignNewGamePage.setActive();		
	}

	static onLoadGame() {
		
	}
}

class CampaignSelector {
	static campaignContainer = $<Panel>('#CampaignContainer');
	
	static campaignEntries: CampaignEntry[] = [];

	static init() {
		this.reloadList();
	}

	static createCampaignEntries() {
		if (!this.campaignContainer) return;

		const campaigns = CampaignAPI.GetAllCampaigns();
		
		for (let i = 0; i < campaigns.length; ++i) {

			const panel = $.CreatePanel('Panel', this.campaignContainer, 'campaign' + i);
			panel.LoadLayoutSnippet('CampaignEntrySnippet');

			this.campaignEntries.push(new CampaignEntry(i, panel, campaigns[i]));
		}

		for (const campaign of this.campaignEntries) {
			campaign.update();
		}
	}
	
	static purgeCampaignList() {
		while (this.campaignEntries.length > 0) this.campaignEntries.pop()?.panel.DeleteAsync(0);
	}

	static reloadList() {
		this.purgeCampaignList();
		this.createCampaignEntries();
	}
}

class CampaignMgr {

	static currentCampaign: CampaignInfo|null = null;

	static init() {
		CampaignStartPage.init();
		CampaignNewGamePage.init();
		CampaignSelector.init();
	}

	static reload() {
		CampaignNewGamePage.hide();
		CampaignStartPage.hide();
		CampaignSelector.reloadList();
	}

	static startGame(chapter: string) {
		if(this.currentCampaign) {
			CampaignAPI.StartCampaign(this.currentCampaign.id, chapter);
		}
	}

	static campaignSelected(info: CampaignInfo) {
		this.currentCampaign = info;

		CampaignNewGamePage.hide();
		CampaignStartPage.setActive();

		// We should only be changing the active campaign while not in a map
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
			if(CampaignAPI.SetActiveCampaign(this.currentCampaign.id)) {
				$.DispatchEvent("ReloadBackground");
			}
		}
	}
}
