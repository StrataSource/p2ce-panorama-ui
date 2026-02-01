'use strict';

class PlayMenu {
	static setPlayerMenuLines() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Play'),
			$.Localize('#MainMenu_Navigation_Play_Modes')
		);
	}

	static onSinglePlayerBtnPressed() {
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SELECTOR_TYPE] = PlayerMode.SINGLEPLAYER;

		$.DispatchEvent('MainMenuOpenNestedPage', 'Campaigns', 'campaigns/campaign-selector', undefined);
	}

	static onMultiPlayerBtnPressed() {
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SELECTOR_TYPE] = PlayerMode.MULTIPLAYER;

		$.DispatchEvent('MainMenuOpenNestedPage', 'Campaigns', 'campaigns/campaign-selector', undefined);
	}
}
