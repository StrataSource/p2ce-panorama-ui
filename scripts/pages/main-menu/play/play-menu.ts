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
		$.DispatchEvent('MainMenuOpenNestedPage', 'SinglePlayer', 'main-menu/play/singleplayer/content-selector-sp', undefined);
	}

	static onMultiPlayerBtnPressed() {
		$.DispatchEvent('MainMenuOpenNestedPage', 'MultiPlayer', 'main-menu/play/multiplayer/content-selector-mp', undefined);
	}
}
