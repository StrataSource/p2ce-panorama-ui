'use strict';

interface PlayerInfo {
	name: string; // Cached username
	steamID: steamID; // User SteamID

	host: boolean; // Player is host of the lobby
	slotIndex: number; // Displayed UI slot, maybe not needed here and instead left to the UI

	hasAllAddons?: boolean; // Has required installed addons

	team?: Team; // Game team
}

class PlayerEntry {

	playerEntryPanel: Panel;
	playerAvatar: AvatarImage;
	playerInfo: PlayerInfo;

	kickBtn: Button;
	banBtn: Button;
	steamProfileBtn: Button;

	hostIcon: Image;
	steamFriendIcon: Image;

	constructor (steamID: steamID, isHost: boolean = false) {
		this.playerEntryPanel = $.CreatePanel('Panel', LobbyMenu.playerListPanel, steamID);
		this.playerEntryPanel.LoadLayoutSnippet('PlayerEntry');

		this.playerInfo = {
			name: FriendsAPI.GetNameForXUID(steamID),
			steamID: steamID,
			host: isHost,
			slotIndex: LobbyMenu.players.size
		};

		this.playerAvatar = this.playerEntryPanel.FindChildTraverse('PlayerAvatar')!;
		this.playerAvatar.steamid = steamID;
		this.playerEntryPanel.SetDialogVariable('name', this.playerInfo.name);

		this.kickBtn = this.playerEntryPanel.FindChildTraverse('KickBtn')!;
		this.kickBtn.SetPanelEvent('onactivate', this.kickPlayer.bind(this));

		this.banBtn = this.playerEntryPanel.FindChildTraverse('BanBtn')!;
		this.banBtn.SetPanelEvent('onactivate', this.banPlayer.bind(this));

		this.steamProfileBtn = this.playerEntryPanel.FindChildTraverse('SteamProfileBtn')!;
		this.steamProfileBtn.SetPanelEvent('onactivate', this.openSteamProfile.bind(this));

		this.hostIcon = this.playerEntryPanel.FindChildTraverse('HostPlayerIcon')!;
		this.steamFriendIcon = this.playerEntryPanel.FindChildTraverse('SteamFriendIcon')!;

		// TODO-FIXME: No proper way to check for the host yet.
		if (this.playerInfo.host) {
			this.kickBtn.AddClass('hide');
			this.banBtn.AddClass('hide');
			this.hostIcon.RemoveClass('hide');
		}
	}

	destruct() {
		this.playerEntryPanel.DeleteAsync(0);
	}

	kickPlayer() {
		$.Msg(`Kicked player: ${this.playerInfo.name}`);
		// TODO: Kick/Ban API
		// LobbyMenu.playerLeft(this.playerInfo.steamID);
	}

	// Currently only "bans" player during the Panels lifetime.
	banPlayer() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Are you sure?',
			`[HC] Are you sure you want to ban "${this.playerInfo.name}" from the current lobby?`,
			'generic-popup',
			() => {
				$.Msg(`Banned player: ${this.playerInfo.name}`);
				LobbyMenu.banList.push(this.playerInfo.steamID);
				// TODO: Kick/Ban API
				// LobbyMenu.playerLeft(this.playerInfo.steamID);
			},
			() => {}
		);
	}

	openSteamProfile() {
		SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/profiles/${this.playerInfo.steamID}`);
	}
}


class LobbyMenu {

	static players: Map<steamID, PlayerEntry> = new Map;
	static banList: Array<steamID> = []; // Temp test banned player array.

	static playerListPanel = $<Panel>('#PlayerList')!;

	static onLoad() {
		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuSwitchReverse', false);

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_PlayerStateChanged',
			() => {
				this.refreshPlayers();
			}
		);

		this.refreshPlayers();
	}

	static refreshPlayers() {
		for (const [id, player] of this.players) {
			player.destruct();
		}
		this.players.clear();
		const players = P2CELobbyAPI.GetPlayerList();
		for (const player of players) {
			this.players.set(player.id, new PlayerEntry(player.id, player.owner));
		}
	}

	static dumpPlayerEntries() {
		this.players.forEach(playerEntry => {
			$.Msg(`Player Name: ${playerEntry.playerInfo.name}`);
			$.Msg(`Player SteamID: ${playerEntry.playerInfo.steamID}`);
			$.Msg(`Player Is Host?: ${playerEntry.playerInfo.host}`);
			$.Msg(`Player Slot Index: ${playerEntry.playerInfo.slotIndex}`);
			$.Msg('');
		});
	}

	static requestExit() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Exit Lobby?',
			'[HC] Are you sure you want to disconnect from the current lobby?',
			'generic-popup',
			() => {
				P2CELobbyAPI.ExitLobby();
			},
			() => {}
		);
	}

	static staffForceStart() {
		P2CELobbyAPI.StartGameSession();
	}
}
