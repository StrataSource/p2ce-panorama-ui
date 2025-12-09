'use strict';

class PlayMenu {
	static setPlayMenuLines() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Play'),
			$.Localize('#MainMenu_Navigation_Play_Tagline')
		);
	}

	static setPlayerMenuLines() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Play'),
			$.Localize('#MainMenu_Navigation_Play_Modes')
		);
	}

	static setMapPoolLines() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Play'),
			$.Localize('#MainMenu_Navigation_Play_MapTypes')
		);
	}

	// root screen
	// shows the player count selection page
	static onCampaignsBtnPressed() {
		UiToolkitAPI.GetGlobalObject()['GameType'] = GameType.P2CE_CAMPAIGN;

		$.DispatchEvent('MainMenuOpenNestedPage', 'PlayerMode', 'play-menu/player-mode');
	}

	// shows the solo map type page
	static onSoloMapsBtnPressed() {
		$.DispatchEvent('MainMenuOpenNestedPage', 'SoloMapMode', 'play-menu/solo-map-mode');
	}

	// solo maps screen
	static onCeMapsBtnPressed() {
		UiToolkitAPI.GetGlobalObject()['GameType'] = GameType.P2CE_MAP;

		$.DispatchEvent('MainMenuOpenNestedPage', 'PlayerMode', 'play-menu/player-mode');
	}

	static onP2MapsBtnPressed() {
		UiToolkitAPI.GetGlobalObject()['GameType'] = GameType.PORTAL2_MAP;

		$.DispatchEvent('MainMenuOpenNestedPage', 'PlayerMode', 'play-menu/player-mode');
	}

	static onSinglePlayerBtnPressed() {
		UiToolkitAPI.GetGlobalObject()['PlayerMode'] = PlayerMode.SINGLEPLAYER;

		$.DispatchEvent('MainMenuOpenNestedPage', 'Campaigns', 'main-menu/campaigns');
	}

	static onMultiPlayerBtnPressed() {
		UiToolkitAPI.GetGlobalObject()['PlayerMode'] = PlayerMode.MULTIPLAYER;

		$.DispatchEvent('MainMenuOpenNestedPage', 'Campaigns', 'main-menu/campaigns');
	}
}
