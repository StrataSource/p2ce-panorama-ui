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
		$.DispatchEvent('MainMenuOpenNestedPage', 'SinglePlayer', 'campaigns/content-selector-main', undefined);
	}

	static onMultiPlayerBtnPressed() {
		$.DispatchEvent('MainMenuOpenNestedPage', 'MultiPlayer', 'campaigns/content-selector-main', undefined);
	}
}
