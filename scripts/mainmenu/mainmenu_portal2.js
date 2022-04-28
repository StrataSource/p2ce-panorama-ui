"use strict";

class MainMenuP2 {
	static onShowMainMenu() {
		$.DispatchEvent("P2CEMainMenuSetBackgroundMovie", "menu_act01");
	}
}

(function () {
	$.RegisterForUnhandledEvent("P2CEShowMainMenu", MainMenuP2.onShowMainMenu);
})();
