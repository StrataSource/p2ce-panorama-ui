'use strict';

class PlayMenu {
	static setPlayerMenuLines() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Play'),
			$.Localize('#MainMenu_Navigation_Play_Modes')
		);
	}

	static onCampaignBtnPressed() {
		$.DispatchEvent('MainMenuOpenNestedPage', 'Campaigns', 'campaigns/campaign-selector', undefined);
	}

	static onSinglePlayerBtnPressed() {
		$.DispatchEvent('MainMenuOpenNestedPage', 'SinglePlayerWorkshop', 'campaigns/workshop-selector', undefined);
	}

	static onMultiPlayerBtnPressed() {
		$.DispatchEvent('MainMenuOpenNestedPage', 'MultiPlayerWorkshop', 'campaigns/workshop-selector', undefined);
	}
}
