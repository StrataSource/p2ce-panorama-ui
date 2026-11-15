'use strict';

class LobbyDevSubmenu {

    static submenuPanel: Panel;

	static dumpSlotList() {
		let slot = 0;
        let curPlayerCount = 0;

        $.Msg('------------------');
		(UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_LOBBYINFO] as LobbyInfo).lobbySlots.forEach(playerEntry => {
			$.Msg(`Slot: ${slot++}`);
			if (playerEntry.lobbyPlayer) {
				$.Msg(`Player SteamID: ${playerEntry.lobbyPlayer.id}`);
				$.Msg(`Player Name: ${playerEntry.lobbyPlayer.name}`);
				$.Msg(`Player Is Host?: ${playerEntry.lobbyPlayer.owner}`);
				$.Msg(`Player State: ${playerEntry.lobbyPlayer.state}`);
				$.Msg(`Player LobbyTeam: ${playerEntry.lobbyPlayer.team}`);
				$.Msg('');
				curPlayerCount++;
				return;
			}

			$.Msg('Empty slot...');
			$.Msg('');
		});
        $.Msg(`Total Players: ${curPlayerCount}`);
        $.Msg('------------------');
	}

	static dumpBanList() {
		const banList = P2CELobbyAPI.GetBannedPlayers();
		if (banList.length === 0) {
			$.Msg('No ban list has been generated or there are no banned players!');
		}

		banList.forEach(steamID => {
			$.Msg(`Player SteamID: ${steamID}`);
			$.Msg(`Player Name: ${FriendsAPI.GetNameForXUID(String(steamID))}`);
			$.Msg('');
		});
	}

    static onLoad() {
        this.submenuPanel = $.GetContextPanel();

        $.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_LobbyStateChanged', (metadata: LobbyData) => {
            this.submenuPanel.SetDialogVariable('campaignid', metadata.campaign);
        });

        this.submenuPanel.SetDialogVariable('campaignid', (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_LOBBYINFO] as LobbyInfo).lobbyData.campaign);
    }

}
