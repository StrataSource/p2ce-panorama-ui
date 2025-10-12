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

		this.panel.SetPanelEvent('onactivate', () => CampaignSelector.campaignSelected(this.info));
	}

}

class ChapterEntry {
	index: number;
	panel: Panel;
	info: ChapterInfo;

	constructor(index: number, panel: Panel, info: ChapterInfo) {
		this.index = index;
		this.panel = panel;
		this.info = info;
	}

	update() {
		const title = this.panel.FindChildTraverse('ChapterTitle') as Label;
		title.text = $.Localize(this.info.title);

		const image = this.panel.FindChildTraverse('ChapterCover') as Image;
		image.SetImage(this.info.thumbnail.length > 0 ? 'file://{materials}/' + this.info.thumbnail + '.vtf' : 'file://{images}/menu/missing-cover.png');

		this.panel.SetPanelEvent('onactivate', () => CampaignSelector.startGame(this.info.id));
	}
}

class CampaignSelector {
	static campaignContainer = $<Panel>('#CampaignContainer');
	static chapterContainer = $<Panel>('#ChapterContainer');

	static campaignEntries: CampaignEntry[] = [];
	static chapterEntries: ChapterEntry[] = [];

	static currentCampaign: string = "";

	static init() {

		this.createCampaignEntries();
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

	static createChapterEntries(info: CampaignInfo) {
		if (!this.chapterContainer) return;

		for (let i = 0; i < info.chapters.length; ++i) {

			const panel = $.CreatePanel('Panel', this.chapterContainer, 'chapter' + i);
			panel.LoadLayoutSnippet('ChapterEntrySnippet');

			this.chapterEntries.push(new ChapterEntry(i, panel, info.chapters[i]));
		}

		for (const chapter of this.chapterEntries) {
			chapter.update();
		}
	}

	static purgeChapterList() {
		while (this.chapterEntries.length > 0) this.chapterEntries.pop()?.panel.DeleteAsync(0);
	}

	static campaignSelected(info: CampaignInfo) {
		this.purgeChapterList();
		this.createChapterEntries(info);

		this.currentCampaign = info.id;
	}

	static reloadList() {
		this.purgeCampaignList();
		this.createCampaignEntries();
	}

	static startGame(chapter: string) {
		GameInterfaceAPI.ConsoleCommand("campaign_start \"" + this.currentCampaign + "\" \"" + chapter + "\"")
	}
}
