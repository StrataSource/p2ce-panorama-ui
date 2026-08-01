'use strict';

class LobbyMenu {
	static onLoad() {
		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuSwitchReverse', false);
	}

	static requestExit() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Exit Lobby?',
			'[HC] Are you sure you want to disconnect from the current lobby?',
			'generic-popup',
			() => {
				CampaignAPI.SetActiveCampaign(null);
			},
			() => {}
		);
	}
}
