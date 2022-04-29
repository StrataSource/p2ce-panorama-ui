"use strict";

class MainMenuP2CE {
	static onShowMainMenu() {
		$.DispatchEvent("P2CEMainMenuSetBackgroundMovie", "community_bg1");
	}

	static hideQuitMenu(bool = true) {
		const panel = $("#QuitMenu");
		if(!bool){
			panel.RemoveClass('Disabled');
			panel.AddClass('Enabled');
			panel.RemoveClass('MainMenuSubContainerDisabled');
			panel.AddClass('MainMenuSubContainerEnabled');
		} else {
			$.Schedule(0.2, ()=>panel.RemoveClass('Enabled'));
			$.Schedule(0.2, ()=>panel.AddClass('Disabled'));
			panel.RemoveClass('MainMenuSubContainerEnabled');
			panel.AddClass('MainMenuSubContainerDisabled');
		}
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
