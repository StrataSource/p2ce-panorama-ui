'use strict';

interface LobbySettings {
	hostName: string;
	tags: string;
	maxPlayers: number;
	password: string;
	lan: boolean;
	cheats: boolean;

	allowClientInvites: boolean; // Allowing connected clients to issue lobby invites themselves.
	visibility: LobbyVisibility;
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
			team: (LobbyMenu.slots.size % 2 === 0) ? Team.TEAM_ATLAS : Team.TEAM_PBODY
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

		this.playerEntryPanel.SetPanelEvent('onmouseover', () => {
			if (!P2CELobbyAPI.IsLobbyOwner || lobbyPlayer.id === UserAPI.GetXUID()) return;

			this.kickBtn.visible = true;
			this.banBtn.visible = true;
		});
		this.playerEntryPanel.SetPanelEvent('onmouseout', () => {
			this.kickBtn.visible = false;
			this.banBtn.visible = false;
		});

		//this.addonMissingNotice = this.playerEntryPanel.FindChildTraverse('MissingAddons')!;
		this.hostIcon = this.playerEntryPanel.FindChildTraverse('HostPlayerIcon')!;
		this.steamFriendIcon = this.playerEntryPanel.FindChildTraverse('SteamFriendIcon')!;

		if (lobbyPlayer.owner || !P2CELobbyAPI.IsLobbyOwner()) {
			this.hostIcon.RemoveClass('hide');
			this.kickBtn.AddClass('hide');
			this.banBtn.AddClass('hide');
		}

		if (!this.playerInfo.hasAllAddons) {
			this.hostIcon.RemoveClass('hide');
		}
	}

	destruct() {
		this.playerEntryPanel.DeleteAsync(0);
	}

	kickPlayer() {
		$.Msg(`Kicked player: ${this.playerInfo.lobbyInfo.name} (${this.playerInfo.lobbyInfo.id})`);
		P2CELobbyAPI.KickPlayer(this.playerInfo.lobbyInfo.id);
	}

	// Currently only "bans" player during the Panels lifetime.
	banPlayer() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Are you sure?',
			`[HC] Are you sure you want to ban "${this.playerInfo.lobbyInfo.name}" from the current lobby?`,
			'warning-popup',
			() => {
				$.Msg(`Banned player: ${this.playerInfo.lobbyInfo.name} (${this.playerInfo.lobbyInfo.id})`);
				P2CELobbyAPI.BanPlayer(this.playerInfo.lobbyInfo.id);
			},
			() => {}
		);
	}

	openSteamProfile() {
		SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/profiles/${this.playerInfo.lobbyInfo.id}`);
	}
}

class EmptyEntry {

	emptyEntryPanel: Panel;

	constructor(slot: number) {
		this.emptyEntryPanel = $.CreatePanel('Panel', LobbyMenu.playerListPanel, `emptySlot_${slot}`);
		this.emptyEntryPanel.LoadLayoutSnippet('EmptyEntry');
	}

	destruct() {
		this.emptyEntryPanel.DeleteAsync(0);
	}
}

class LobbyMenu {

	static lobbySettings: LobbySettings;

	static slots: Map<steamID | number, PlayerEntry | EmptyEntry> = new Map;
	static numPlayers: number;

	static playerListPanel = $<Panel>('#PlayerList')!;
	static startButton = $<Button>('#StartButton')!;

	static music: uuid | undefined = undefined;

	static onLoad() {
		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuSwitchReverse', false);
		$.DispatchEvent('MainMenuHideBackgroundImage', true);
		$.DispatchEvent('MainMenuHideBackgroundMovie');

		$.RegisterForUnhandledEvent('MapUnloaded', () => {
			$.Msg('OAKHJSOIHASHOIFAIOS');
			this.stopMusic();
		});

		$.RegisterForUnhandledEvent('MainMenuModeRequestCleanup', () => {
			this.stopMusic();
		});

		$.RegisterForUnhandledEvent('LayoutReloaded', () => {
			$.Msg('OAKHJSOIHASHOIFAIOS');
			this.stopMusic();
		});

		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerJoined', this.playerJoin.bind(this));
		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerLeft', this.playerLeft.bind(this));

		this.lobbySettings = {
			hostName: FriendsAPI.GetLocalPlayerName(),
			tags: '',
			maxPlayers: 2,
			password: '',
			lan: false,
			cheats: false,
			allowClientInvites: false,
			visibility: LobbyVisibility.FRIENDS_ONLY
		}

		const c = CampaignAPI.FindCampaign(P2CELobbyAPI.GetCampaignID());
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

			this.lobbySettings.maxPlayers = c.campaign.multiplayer_options.required_players;
		}

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_PlayerStateChanged',
			() => {
				this.updateUIState();
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

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_OnClientJoiningGame',
			() => {
				// closes out missing addons popup
				UiToolkitAPI.CloseAllVisiblePopups();
			}
		);

		this.updateUIState();

		if (!P2CELobbyAPI.IsLobbyOwner()) {
			this.startButton.AddClass('hide');
		}
	}



	static updateUIState() {

		for (const [id, player] of this.slots) {
			player.destruct();
		}
		this.slots.clear();
		this.numPlayers = 0;
		for (const player of P2CELobbyAPI.GetPlayerList()) {
			this.slots.set(player.id, new PlayerEntry(player));
		}
		this.numPlayers = this.slots.size;

		if (this.slots.size < this.lobbySettings.maxPlayers) {
			for (let slot = this.slots.size; slot < this.lobbySettings.maxPlayers; slot++) {
				this.slots.set(slot, new EmptyEntry(slot));
			}
		}

		if (this.numPlayers >= this.lobbySettings.maxPlayers) {
			this.startButton.enabled = true;
		} else {
			this.startButton.enabled = false;
		}

	}

	static playerJoin(lobbyPlayer: LobbyPlayer) {
		$.Msg('Player joined!');
		$.Msg(`Player Name: ${lobbyPlayer.name}`);
		$.Msg(`Player SteamID: ${lobbyPlayer.id}`);
		this.slots.set(lobbyPlayer.id, new PlayerEntry(lobbyPlayer));

		this.updateUIState();
	}

	static playerLeft(lobbyPlayer: LobbyPlayer) {
		$.Msg('Player left!');
		$.Msg(`Player Name: ${lobbyPlayer.name}`);
		$.Msg(`Player SteamID: ${lobbyPlayer.id}`);
		LobbyMenu.slots.get(lobbyPlayer.id)?.destruct();
		LobbyMenu.slots.delete(lobbyPlayer.id);

		this.updateUIState();
	}

	static dumpSlotList() {
		this.slots.forEach(playerEntry => {

			if (playerEntry instanceof PlayerEntry) {
				$.Msg(`Player Name: ${playerEntry.playerInfo.lobbyInfo.name}`);
				$.Msg(`Player SteamID: ${playerEntry.playerInfo.lobbyInfo.id}`);
				$.Msg(`Player Is Host?: ${playerEntry.playerInfo.lobbyInfo.owner}`);
				$.Msg(`Player Has All Required Addons?: ${playerEntry.playerInfo.hasAllAddons}`);
				$.Msg(`Player Team: ${playerEntry.playerInfo.team}`);
				$.Msg('');
				return;
			}

			$.Msg('Empty slot...');
			$.Msg('');

		});
	}

		// Set of test player entries.
		// this.playerJoin(UserAPI.GetXUID(), true);	// You
		// this.playerJoin('76561198046114191');		// storm
		// this.playerJoin('76561199136235250'); 		// lenship2
		// this.playerJoin('76561198827650159'); 		// D0ctorZer0 (Ash)
		// this.playerJoin('76561198031029097'); 		// Ozxybox
		// this.playerJoin('76561198132780615'); 		// JJl77
		// this.playerJoin('76561198037202538'); 		// HugoBDesigner
		// this.playerJoin('76561198110464793'); 		// Avery
		// this.playerJoin('76561198029590837'); 		// Smaed
		// this.playerJoin('76561198349038620'); 		// JoLoZ
		// this.playerJoin('76561198114725103'); 		// SCell555
		// this.playerJoin('76561198169437299'); 		// Hazel Rose
		// this.playerJoin('76561197960287930'); 		// Gabe Newell
		// this.playerJoin('76561199038901613'); 		// PhoenyxSource
		// this.playerJoin('76561198338990133'); 		// \n

	static dumpBanList() {
		const banList = LobbyManPanel.retrieveBanList();
		if (banList.length === 0) {
			$.Msg('No ban list has been generated!');
		}

		banList.forEach(steamID => {
			$.Msg(`Player SteamID: ${steamID}`);
			$.Msg(`Player Name: ${FriendsAPI.GetNameForXUID(String(steamID))}`);
			$.Msg('');
		});
	}

	static requestExit() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Exit Lobby?',
			'[HC] Are you sure you want to disconnect from the current lobby?',
			'warning-popup',
			() => {
				if (this.music) $.StopSoundEvent(this.music);
				this.music = undefined;
				P2CELobbyAPI.ExitLobby();
			},
			() => {}
		);
	}

	static startGame() {
		if (!P2CELobbyAPI.IsLobbyOwner()) {
			return;
		}

		P2CELobbyAPI.StartGameSession();
	}

	static stopMusic() {
		if (this.music) $.StopSoundEvent(this.music);
		this.music = undefined;
	}

	static startToolTipShow(show: boolean) {
		if (!this.startButton.enabled && show) {
			UiToolkitAPI.ShowTextTooltip('StartButton', $.Localize('[HC] The lobby does not have enough players to start!'));
		} else {
			UiToolkitAPI.HideTextTooltip();
		}
	}
}

class LobbyManPanel {

	//manPanel: Panel;


	static onLoad() {

	}

	static retrieveBanList(): Array<steamID> {
		const banList = $.LoadKeyValues3File('cfg/lobbybans.kv3') as Record<string, Array<unknown>> as Record<string, Array<steamID>>;
		if (banList === undefined || banList.bans === undefined || !(banList.bans instanceof Array)) {
			return [];
		}

		return banList.bans;
	}



}