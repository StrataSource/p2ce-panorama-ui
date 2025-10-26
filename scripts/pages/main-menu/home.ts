'use strict';

class HomePage {
	static panels = {
		cp: $.GetContextPanel()
	}

	static {
		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onTabShow.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', this.onLayoutReloaded.bind(this));
	}

	static init() {

	}

	static onTabShow(tabid: string) {
		if (tabid !== 'Home') return;
		
		this.panels.cp.SetHasClass(
			'home--PauseMenuMode',
			GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU
		);
	}

	static onLayoutReloaded() {
		this.onTabShow('Home');
	}
}
