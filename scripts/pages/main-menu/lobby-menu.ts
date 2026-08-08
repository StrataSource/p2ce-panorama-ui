'use strict';

interface LobbySettings {
	allowInvites: boolean; // Allowing connected clients to issue invites themselves
	maxPlayers: number
	visibility: LobbyVisibility;

	//? Should this be overridden?
	//multiplayerCampaignSettings: CampaignMultiPlayerOptions;
}

// TODO: Have this match the Team enum.
const TeamName:  Array<string> = [
	// '[HC] Any',
	// '[HC] Invalid',
	'[HC] Unassigned',
	'[HC] Chell/Bendy',
	'[HC] P-Body',
	'[HC] Atlas'
]


/**
 * Information about the player that is slotted in the UI.
 */
interface PlayerInfo {
	lobbyInfo: LobbyPlayer; // Server information about the player.
	hasAllAddons: boolean; // Does the player have the required installed addons?
	team: Team; // Game player team.
}

/**
 * Panel for the player slot.
 */
class PlayerEntry {

	playerEntryPanel: Panel;
	playerAvatar: AvatarImage;
	playerInfo: PlayerInfo;

	kickBtn: Button;
	banBtn: Button;
	steamProfileBtn: Button;

	//addonMissingNotice: Panel;
	hostIcon: Image;
	steamFriendIcon: Image;

	constructor (lobbyPlayer: LobbyPlayer) {
		this.playerEntryPanel = $.CreatePanel('Panel', LobbyMenu.playerListPanel, lobbyPlayer.id);
		this.playerEntryPanel.LoadLayoutSnippet('PlayerEntry');

		this.playerInfo = {
			lobbyInfo: lobbyPlayer,
			hasAllAddons: true, // TODO: Replace with a API function that checks if the user does in fact have needed addons/custom content.
			team: (LobbyMenu.players.size % 2 === 0) ? Team.TEAM_ATLAS : Team.TEAM_PBODY
		};

		this.playerAvatar = this.playerEntryPanel.FindChildTraverse('PlayerAvatar')!;
		this.playerAvatar.steamid = lobbyPlayer.id;
		this.playerEntryPanel.SetDialogVariable('name', lobbyPlayer.name);
		this.playerEntryPanel.SetDialogVariable('teamName', TeamName[this.playerInfo.team]); // TODO: Change to team name than team index.

		this.kickBtn = this.playerEntryPanel.FindChildTraverse('KickBtn')!;
		this.kickBtn.SetPanelEvent('onactivate', this.kickPlayer.bind(this));

		this.banBtn = this.playerEntryPanel.FindChildTraverse('BanBtn')!;
		this.banBtn.SetPanelEvent('onactivate', this.banPlayer.bind(this));

		this.steamProfileBtn = this.playerEntryPanel.FindChildTraverse('SteamProfileBtn')!;
		this.steamProfileBtn.SetPanelEvent('onactivate', this.openSteamProfile.bind(this));

		//this.addonMissingNotice = this.playerEntryPanel.FindChildTraverse('MissingAddons')!;
		this.hostIcon = this.playerEntryPanel.FindChildTraverse('HostPlayerIcon')!;
		this.steamFriendIcon = this.playerEntryPanel.FindChildTraverse('SteamFriendIcon')!;

		// TODO-FIXME: No proper way to check for the host yet.
		if (lobbyPlayer.owner) {
			this.kickBtn.AddClass('hide');
			this.banBtn.AddClass('hide');
			this.hostIcon.RemoveClass('hide');
			LobbyMenu.ownerID = lobbyPlayer.id;
		}

		if (!this.playerInfo.hasAllAddons) {
			this.hostIcon.RemoveClass('hide');
		}
	}

	destruct() {
		this.playerEntryPanel.DeleteAsync(0);
	}

	kickPlayer() {
		$.Msg(`Kicked player: ${this.playerInfo.lobbyInfo.name}`);
		// TODO: Kick/Ban API
		// LobbyMenu.playerLeft(this.playerInfo.steamID);
	}

	// Currently only "bans" player during the Panels lifetime.
	banPlayer() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Are you sure?',
			`[HC] Are you sure you want to ban "${this.playerInfo.lobbyInfo.name}" from the current lobby?`,
			'generic-popup',
			() => {
				$.Msg(`Banned player: ${this.playerInfo.lobbyInfo.name}`);
				LobbyMenu.banList.push(this.playerInfo.lobbyInfo.id);
				// TODO: Kick/Ban API
				// LobbyMenu.playerLeft(this.playerInfo.steamID);
			},
			() => {}
		);
	}

	openSteamProfile() {
		SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/profiles/${this.playerInfo.lobbyInfo.id}`);
	}
}


class LobbyMenu {

	static lobbySettings: LobbySettings;

	static players: Map<steamID, PlayerEntry> = new Map;
	static ownerID: steamID = ''; // SteamID of lobby owner/host.

	static banList: Array<steamID> = []; // Temp test banned player array.

	static playerListPanel = $<Panel>('#PlayerList')!;
	static startButton = $<Button>('#StartButton')!;

	static music: uuid | undefined = undefined;

	static onLoad() {
		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuSwitchReverse', false);
		$.DispatchEvent('MainMenuHideBackgroundImage', true);
		$.DispatchEvent('MainMenuHideBackgroundMovie');

		const c = CampaignAPI.GetActiveCampaign()!;
		if (c) {
			const bgMusic = (c.campaign.meta.get(CampaignMeta.BG_MUSIC) as string) ?? '';
			const bgMovie = (c.campaign.meta.get(CampaignMeta.BG_MOVIE) as string) ?? '';
			const bgImage = (c.campaign.meta.get(CampaignMeta.BG_IMG) as string) ?? '';
			const basePath = getCampaignAssetPath(c);
			const playMusic = () => {
				if (bgMusic.length > 0) {
					this.music = $.PlaySoundEvent(bgMusic);
				}
			};
			if (bgMovie.length > 0) {
				$.DispatchEvent('MainMenuShowBackgroundMovie', `${basePath}${bgMovie}`);
				playMusic();
			} else if (bgImage.length > 0) {
				$.DispatchEvent('MainMenuShowBackgroundImage', `${basePath}${bgImage}`, true);
				playMusic();
			} else {
				$.Warning('CAMPAIGN MENU: No background has been specified! Fix this now!!!');
				$.Warning(
					`Fields:\nbgMusic = ${bgMusic}\nbgMovie = ${bgMovie}\nbgImage = ${bgImage}\nbasePath = ${basePath}`
				);
				$.DispatchEvent('MainMenuShowBackgroundImage', getRandomFallbackImage(), true);
				playMusic();
			}
		}

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_PlayerStateChanged',
			() => {
				this.refreshPlayers();
			}
		);

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_OnStartWithAddonsMissing',
			() => {
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'dependencies',
					'file://{resources}/layout/modals/popups/addon-dependencies.xml',
					'lobbymode=1&cancelAllowed=false'
				);
			}
		);

		this.refreshPlayers();

		if (UserAPI.GetXUID() !== this.ownerID) {
			this.startButton.AddClass('hide');
		}
	}

	static refreshPlayers() {
		for (const [id, player] of this.players) {
			player.destruct();
		}
		this.players.clear();
		for (const player of P2CELobbyAPI.GetPlayerList()) {
			this.players.set(player.id, new PlayerEntry(player));
		}
	}

	static dumpPlayerEntries() {
	this.players.forEach(playerEntry => {
			$.Msg(`Player Name: ${playerEntry.playerInfo.lobbyInfo.name}`);
			$.Msg(`Player SteamID: ${playerEntry.playerInfo.lobbyInfo.id}`);
			$.Msg(`Player Is Host?: ${playerEntry.playerInfo.lobbyInfo.owner}`);
			$.Msg(`Player Has All Required Addons?: ${playerEntry.playerInfo.hasAllAddons}`);
			$.Msg(`Player Team: ${playerEntry.playerInfo.team}`);
			$.Msg('');
		});
	}

	static requestExit() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Exit Lobby?',
			'[HC] Are you sure you want to disconnect from the current lobby?',
			'generic-popup',
			() => {
				if (this.music) $.StopSoundEvent(this.music);
				this.music = undefined;
				P2CELobbyAPI.ExitLobby();
			},
			() => {}
		);
	}

	static staffForceStart() {
		if (UserAPI.GetXUID() !== this.ownerID) {
			return;
		}

		P2CELobbyAPI.StartGameSession();
	}
}
