"use strict";

class MainMenuP2CE {
	static onShowMainMenu() {
		$.DispatchEvent("P2CEMainMenuSetBackgroundMovie", "community_bg1");
	}
	/*
	static onShowPauseMenu() {
	}
	*/
}

(function () {
	$.RegisterForUnhandledEvent("P2CEShowMainMenu", MainMenuP2CE.onShowMainMenu);
	// $.RegisterForUnhandledEvent("P2CEShowPauseMenu", MainMenuP2CE.onShowPauseMenu);
})();
