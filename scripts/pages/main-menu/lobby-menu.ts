'use strict';

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
		LobbyMenu.playerLeft(this.playerInfo.steamID);
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
				LobbyMenu.playerLeft(this.playerInfo.steamID);
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

		//$.RegisterForUnhandledEvent('PanoramaComponent_P2CEMatchmaking_OnPlayerJoinedLobby', this.playerJoin.bind(this));
		//$.RegisterForUnhandledEvent('PanoramaComponent_P2CEMatchmaking_OnPlayerLeftLobby', this.playerLeft.bind(this));

		// Set of test player entries.
		this.playerJoin(UserAPI.GetXUID(), true);	// You
		this.playerJoin('76561198046114191');		// storm
		this.playerJoin('76561199136235250'); 		// lenship2
		this.playerJoin('76561198827650159'); 		// D0ctorZer0 (Ash)
		this.playerJoin('76561198031029097'); 		// Ozxybox
		this.playerJoin('76561198132780615'); 		// JJl77
		this.playerJoin('76561198037202538'); 		// HugoBDesigner
		this.playerJoin('76561198110464793'); 		// Avery
		this.playerJoin('76561198029590837'); 		// Smaed
		this.playerJoin('76561198349038620'); 		// JoLoZ
		this.playerJoin('76561198114725103'); 		// SCell555
		this.playerJoin('76561198169437299'); 		// Hazel Rose
		this.playerJoin('76561197960287930'); 		// Gabe Newell
		this.playerJoin('76561199038901613'); 		// PhoenyxSource
		this.playerJoin('76561198338990133'); 		// \n
	}

	static playerJoin(steamID: steamID, isHost: boolean = false) {
		if (steamID.length === 0) {
			$.Warning('Received invalid SteamID!');
			return;
		}

		if (this.players.has(steamID)) {
			return;
		}

		// Temporary test ban list.
		if (this.banList.find((bannedSteamID: steamID) => {
				return bannedSteamID === steamID;
			})
		) {
			$.Msg(`Player ${FriendsAPI.GetNameForXUID(steamID)}, attempted to join but are banned!`);
			return;
		}

		this.players.set(steamID, new PlayerEntry(steamID, isHost));
	}

	static playerLeft(steamID: steamID) {
		this.players.get(steamID)?.destruct();
		this.players.delete(steamID);
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
				CampaignAPI.SetActiveCampaign(null);
			},
			() => {}
		);
	}

	static staffForceStart(splitscreen: boolean) {
		const c = CampaignAPI.GetActiveCampaign()!;
		if (splitscreen) {
			CampaignAPI.StartCampaign(`${c.bucket.id}/${c.campaign.id}`, '0', 0, CampaignStartFlags.SPLITSCREEN);
		} else {
			CampaignAPI.StartCampaign(`${c.bucket.id}/${c.campaign.id}`, '0', 0);
		}
	}
}
