'use strict';

class LobbyInfo {

    static submenuPanel: Panel

    static onLoad() {
        this.submenuPanel = $.GetContextPanel();

        this.submenuPanel.SetDialogVariableInt('curplayers', 1);
		this.submenuPanel.SetDialogVariableInt('maxplayers', 2);
		this.submenuPanel.SetDialogVariableInt('requiredplayers', 2); // TODO: Fix me once required and max players are two separate things.
		this.submenuPanel.SetDialogVariableInt('readyplayers', 0);
		this.submenuPanel.SetDialogVariable('campaignname', 'INSERT CAMPAIGN NAME HERE');
		this.submenuPanel.SetDialogVariable('campaignid', 'INSERT ID HERE');


        // const lobbySettings = LobbyMenu.getLobbySettings();
        // $.Msg(lobbySettings);
        // const numPlayers = LobbyMenu.getLobbyPlayerCount();

        // this.submenuPanel.SetDialogVariableInt('curplayers', LobbyMenu.numPlayers);
		// this.submenuPanel.SetDialogVariableInt('maxplayers', LobbyMenu.lobbySettings.maxPlayers);
		// this.submenuPanel.SetDialogVariableInt('requiredplayers', LobbyMenu.lobbySettings.maxPlayers); // TODO: Fix me once required and max players are two separate things.
    }
}
