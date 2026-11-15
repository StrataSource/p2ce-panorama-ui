'use strict';

class LobbyInfoSubmenu {

    static submenuPanel: Panel;

    private static getCurPlayerStats(): { curPlayerCount: number, numReadyPlayers: number } {
        const playerList = P2CELobbyAPI.GetPlayerList();
        const playerStats: { curPlayerCount: number, numReadyPlayers: number } = {
            curPlayerCount: playerList.length, numReadyPlayers: 0
        };
        playerList.forEach(player => {
            if (player.state === LobbyMemberReadyState.READY)
                playerStats.numReadyPlayers++;
        });

        return playerStats;
    }

    private static updateStats() {
        const lobbyInfo = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_LOBBYINFO] as LobbyInfo;
        const playerStats = LobbyInfoSubmenu.getCurPlayerStats();

        const campaignPair = CampaignAPI.FindCampaign(P2CELobbyAPI.GetCampaignID())!;
        if (!campaignPair) {
            throw new Error('"campaignPair" is invalid for lobby-info submenu!');
        }

        this.submenuPanel.SetDialogVariableInt('curplayers', playerStats.curPlayerCount);
        this.submenuPanel.SetDialogVariableInt('maxplayers', lobbyInfo.lobbySettings.maxPlayers);
        this.submenuPanel.SetDialogVariableInt('requiredplayers', lobbyInfo.lobbySettings.requiredPlayers);
        this.submenuPanel.SetDialogVariableInt('readyplayers', playerStats.numReadyPlayers);

    }

    static onLoad() {
        this.submenuPanel = $.GetContextPanel();

        $.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_LobbyStateChanged', (metadata: LobbyData) => {
            LobbyInfoSubmenu.updateStats();
        });

        $.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerStateChanged', (who: steamID, lobbyPlayer: LobbyPlayer) => {
            LobbyInfoSubmenu.updateStats();
        });

        LobbyInfoSubmenu.updateStats();
    }
}
