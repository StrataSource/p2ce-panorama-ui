'use strict';


class LobbyInfo {

    static infoPanel: Panel //= $('#LobbyManSubMenuInsert')!;

    static onLoad() {

        this.infoPanel = $.GetContextPanel();

this.infoPanel.SetDialogVariableInt('curplayers', 1);
		this.infoPanel.SetDialogVariableInt('maxplayers', 12);
		this.infoPanel.SetDialogVariableInt('requiredplayers', 4); // TODO: Fix me once required and max players are two separate things.

        // this.infoPanel.SetDialogVariableInt('curplayers', LobbyMenu.numPlayers);
		// this.infoPanel.SetDialogVariableInt('maxplayers', LobbyMenu.lobbySettings.maxPlayers);
		// this.infoPanel.SetDialogVariableInt('requiredplayers', LobbyMenu.lobbySettings.maxPlayers); // TODO: Fix me once required and max players are two separate things.
    }

}