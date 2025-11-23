'use strict';

class CampaignSettingsTab {
	static page = $<Panel>('#CampaignSettingsContainer')!;
	static chImage = $<Image>('#CampaignSettingsChapterImage')!;
	static chText = $<Label>('#CampaignSettingsChapter')!;
	static mapText = $<Label>('#CampaignSettingsMap')!;

	static init() {
		this.hide();
	}

	static setActive() {
		CampaignHome.closeListerNoReturn();
		this.show();
		this.chImage.SetImage(`file://{materials}/${CampaignMgr.uiSelectedChapter!.thumbnail}.vtf`);
		this.chText.text = $.Localize(CampaignMgr.uiSelectedChapter!.title);
		this.mapText.text = CampaignMgr.uiSelectedChapter!.maps[0].name;
	}

	static show() {
		this.page.visible = true;
		
	}

	static hide() {
		this.page.visible = false;
	}

	static clear() {
		this.hide();
		CampaignHome.openControls();
	}

	static finishSettings() {
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.Localize('#Action_NewGame_Title'),
			tagDevString('Start a new game with these settings?\n\nWARNING: Gameplay modifiers cannot be changed once a save has started!'),
			'warning-popup',
			$.Localize('#UI_Yes'),
			() => {
				CampaignMgr.startGame();
				this.clear();
			},
			$.Localize('#UI_Cancel'),
			() => {},
			'blur'
		);
	}
}
