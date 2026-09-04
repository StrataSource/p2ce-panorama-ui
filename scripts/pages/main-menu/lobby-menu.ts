'use strict';

interface LobbySettings {
	hostName: string;
	tags: string;
	password: string;
	lan: boolean;
	cheats: boolean;

	allowClientInvites: boolean; // Allowing connected clients to issue lobby invites themselves.
	visibility: LobbyVisibility;
	maxPlayers: number;
	maxTeams: number;
	requiredPlayers: number;
	requiredNumTeamPlayers: number;
	canSwitchTeams: boolean;
	hasSpectatorMode: boolean;
}

/**
 * Information about the player that is slotted in the UI.
 */
interface PlayerInfo {
	lobbyPlayer: LobbyPlayer; // Server information about the player.
	hasAllAddons: boolean; // Does the player have the required installed addons?
	team: LobbyTeam; // Game player team.
}

type TeamMetaKey = 'name' | 'icon' | 'bgMusic' | 'bgMovie' | 'bgImage';

type TeamMetaEntry = {
	src: string;
	meta: CampaignMeta | null;
};

type TeamMeta = Record<TeamMetaKey, TeamMetaEntry>;

function isValidTeam(team: LobbyTeam) {
	switch (team) {
		case LobbyTeam.ANY:
		case LobbyTeam.SPECTATOR:
		case LobbyTeam.RED:
		case LobbyTeam.BLUE:
			return true;
		default:
			return false;
	}
}

function getNumPlayersOnTeam(team: LobbyTeam): number {
	if (!isValidTeam(team)) {
		//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
		throw new Error('Invalid team has been specified for getPlayersOnTeam!');
	}

	let numPlayers = 0;
	LobbyMenu.lobbySlots.forEach(slot => {
		if (slot instanceof EmptyEntry) {
			return;
		}

		const playerEntry = slot as PlayerEntry;
		if (playerEntry.playerInfo.team === team) numPlayers++;
	});

	return numPlayers;
}

function enoughPlayersForGame(): boolean {
	let teamCount = 0;
	for (let team = LobbyTeam.RED; team < LobbyTeam.COUNT; team++) {
		if (teamCount === LobbyMenu.lobbySettings.maxTeams) break;

		const numTeamPlayers = getNumPlayersOnTeam(team);
		if (numTeamPlayers < LobbyMenu.lobbySettings.requiredNumTeamPlayers) {
			return false;
		}

		teamCount++;
	}

	return true;
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

	hostIcon: Image;
	steamFriendIcon: Image;
	addonMissingNotice: Panel;
	teamIcon: Image;
	teamSwitchBtn: Button;

	constructor (lobbyPlayer: LobbyPlayer, team: LobbyTeam) {
		this.playerEntryPanel = $.CreatePanel('Panel', LobbyMenu.playerListPanel, `playerslot_${lobbyPlayer.id}`);
		this.playerEntryPanel.LoadLayoutSnippet('PlayerEntry');

		this.playerInfo = {
			lobbyPlayer: lobbyPlayer,
			hasAllAddons: true, // TODO: Replace with a API function that checks if the user does in fact have needed addons/custom content.
			team: team
		};

		this.playerAvatar = this.playerEntryPanel.FindChildTraverse('PlayerAvatar')!;
		this.playerAvatar.steamid = lobbyPlayer.id;
		this.playerEntryPanel.SetDialogVariable('name', lobbyPlayer.name);

		if (!isValidTeam(this.playerInfo.team)) {
			//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
			throw new Error('Invalid team has been specified for new PlayerEntry! This is not right, please report to P2:CE developers!');
		}

		const teamMeta = LobbyMenu.teamMeta[this.playerInfo.team];

		this.playerEntryPanel.SetDialogVariable('teamName', teamMeta.name.src);

		this.kickBtn = this.playerEntryPanel.FindChildTraverse('KickBtn')!;
		this.kickBtn.SetPanelEvent('onactivate', this.kickPlayer.bind(this));

		this.banBtn = this.playerEntryPanel.FindChildTraverse('BanBtn')!;
		this.banBtn.SetPanelEvent('onactivate', this.banPlayer.bind(this));

		this.steamProfileBtn = this.playerEntryPanel.FindChildTraverse('SteamProfileBtn')!;
		this.steamProfileBtn.SetPanelEvent('onactivate', this.openSteamProfile.bind(this));

		this.teamSwitchBtn = this.playerEntryPanel.FindChildTraverse('TeamSwitchBtn')!;
		this.teamSwitchBtn.SetPanelEvent('onactivate', this.teamSwitchContextMenu.bind(this));

		const isThisClientEntry = lobbyPlayer.id === UserAPI.GetXUID();

		this.teamSwitchBtn.enabled = false;
		// TODO: Remove when the team icon placement is not influenced by the visibility of the ban and kick buttons on the host.
		if (P2CELobbyAPI.IsLobbyOwner() && !lobbyPlayer.owner) {
			this.kickBtn.visible = true;
			this.banBtn.visible = true;
		}
		// TODO: Temporary disabled until the team icon placement is done better.
		// this.playerEntryPanel.SetPanelEvent('onmouseover', () => {
		// 	if (!P2CELobbyAPI.IsLobbyOwner || isThisClientEntry) return;

		// 	this.kickBtn.visible = true;
		// 	this.banBtn.visible = true;
		// });
		// this.playerEntryPanel.SetPanelEvent('onmouseout', () => {
		// 	this.kickBtn.visible = false;
		// 	this.banBtn.visible = false;
		// });

		if (LobbyMenu.lobbySettings.canSwitchTeams) {
			this.teamSwitchBtn.enabled = true;
		}

		this.addonMissingNotice = this.playerEntryPanel.FindChildTraverse('MissingAddons')!;
		this.hostIcon = this.playerEntryPanel.FindChildTraverse('HostPlayerIcon')!;
		this.steamFriendIcon = this.playerEntryPanel.FindChildTraverse('SteamFriendIcon')!;
		this.teamIcon = this.playerEntryPanel.FindChildTraverse('TeamIcon')!;

		if (!this.playerInfo.hasAllAddons) {
			this.addonMissingNotice.visible = true;
		}

		if (lobbyPlayer.owner) {
			this.hostIcon.visible = true;
		}

		this.teamIcon.SetImage(teamMeta.icon.src);

		// Load team based campaign assets for the client side once.
		if (isThisClientEntry && !LobbyMenu.clientAssetsLoaded) {
			LobbyMenu.loadCampaignMenuAssets(this.playerInfo.team);
		}
	}

	destruct() {
		this.playerEntryPanel.RemoveAndDeleteChildren();
		this.playerEntryPanel.DeleteAsync(0);
	}

	kickPlayer() {
		$.Msg(`Kicked player: ${this.playerInfo.lobbyPlayer.name} (${this.playerInfo.lobbyPlayer.id})`);
		P2CELobbyAPI.KickPlayer(this.playerInfo.lobbyPlayer.id);
	}

	// Currently only "bans" player during the Panels lifetime.
	banPlayer() {
		$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Are you sure?',
			`[HC] Are you sure you want to ban "${this.playerInfo.lobbyPlayer.name}" from the current lobby?`,
			'warning-popup',
			() => {
				$.Msg(`Banned player: ${this.playerInfo.lobbyPlayer.name} (${this.playerInfo.lobbyPlayer.id})`);
				P2CELobbyAPI.BanPlayer(this.playerInfo.lobbyPlayer.id);
			},
			() => {}
		);
	}

	openSteamProfile() {
		SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/profiles/${this.playerInfo.lobbyPlayer.id}`);
	}

	switchTeam(newTeam: LobbyTeam) {
		if (!isValidTeam(this.playerInfo.team)) {
			//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
			throw new Error('Invalid team has been specified for team switch! This is not right, please report to P2:CE developers!');
		}

		const newTeamMeta = LobbyMenu.teamMeta[newTeam];

		$.Msg(`Switching player team from "${LobbyMenu.teamMeta[this.playerInfo.team].name.src}" to "${newTeamMeta.name.src}"`);
		this.playerInfo.team = newTeam;
		this.teamIcon.SetImage(newTeamMeta.icon.src);
		P2CELobbyAPI.SetTeam(newTeam);
	}

	teamSwitchContextMenu() {
		const items: UiToolkitAPI.SimpleContextMenuItem[] = [];

		let teamCount = 0;
		for (let team = LobbyMenu.lobbySettings.hasSpectatorMode ? LobbyTeam.SPECTATOR : LobbyTeam.RED; team < LobbyTeam.COUNT; team++) {
			if (teamCount === LobbyMenu.lobbySettings.maxTeams) break;

			const teamMeta = LobbyMenu.teamMeta[team];

			if (team !== this.playerInfo.team) {
				items.push({
					label: teamMeta.name.src,
					jsCallback: () => {
						this.switchTeam(team);
					},
					icon: teamMeta.icon.src
				});
			}

			teamCount++;
		}

		UiToolkitAPI.ShowSimpleContextMenu('TeamSwitchBtn', '', items);
	}
}

/**
 * Panel for a empty player slot.
 */
class EmptyEntry {

	emptyEntryPanel: Panel;
	emptySlotAvatar: Image;

	constructor(slot: number) {
		this.emptyEntryPanel = $.CreatePanel('Panel', LobbyMenu.playerListPanel, `emptySlot_${slot}`);
		this.emptyEntryPanel.LoadLayoutSnippet('EmptyEntry');

		this.emptySlotAvatar = this.emptyEntryPanel.FindChildTraverse('EmptyEntryAvatar')!;
		this.emptySlotAvatar.SetImage(LobbyMenu.emptySlotAvatarSrc);
	}

	destruct() {
		this.emptyEntryPanel.RemoveAndDeleteChildren();
		this.emptyEntryPanel.DeleteAsync(0);
	}
}

class LobbyMenu {

	static lobbySettings: LobbySettings;

	static lobbySlots: Map<steamID | number, PlayerEntry | EmptyEntry> = new Map;
	static numPlayers: number = 0;

	static playerListPanel = $<Panel>('#PlayerList')!;
	static lobbyManPanel = $<Panel>('#LobbyManPanel')!;
	static startButton = $<Button>('#StartButton')!;

	static clientInviteButton: Button = $<Button>('#ClientInviteButton')!;

	static bgMusicID: uuid | undefined = undefined;
	static campaignPair: CampaignPair;

	static clientAssetsLoaded: boolean = false; //! Goofy bool which should probably be eliminated at some point for the client side.

	// Retrieve and store assets that are team specific for future meta asset access.
	static teamMeta: Record<LobbyTeam, TeamMeta> = {
		[LobbyTeam.ANY]: {
			name: { src: '[HC] Any', meta: null },
			icon: { src: 'file://{images}/menu/missing-cover.png', meta: null },
			bgMusic: { src: '', meta: null },
			bgMovie: { src: '', meta: null },
			bgImage: { src: '', meta: null },
		},
		[LobbyTeam.SPECTATOR]: {
			name: { src: '[HC] Spectator', meta: CampaignMeta.TEAM_SPECTATOR_NAME },
			icon: { src: 'file://{images}/menu/missing-cover.png', meta: CampaignMeta.TEAM_SPECTATOR_IMG },
			//
			bgMusic: { src: '', meta: CampaignMeta.TEAM_RED_BG_MUSIC },
			bgMovie: { src: '', meta: CampaignMeta.TEAM_RED_BG_MOVIE },
			bgImage: { src: '', meta: CampaignMeta.TEAM_RED_BG_IMG },
		},
		[LobbyTeam.RED]: {
			name: { src: '[HC] LobbyTeam Red', meta: CampaignMeta.TEAM_RED_NAME },
			icon: { src: 'file://{images}/menu/missing-cover.png', meta: CampaignMeta.TEAM_RED_IMG },
			bgMusic: { src: '', meta: CampaignMeta.TEAM_RED_BG_MUSIC },
			bgMovie: { src: '', meta: CampaignMeta.TEAM_RED_BG_MOVIE },
			bgImage: { src: '', meta: CampaignMeta.TEAM_RED_BG_IMG },
		},
		[LobbyTeam.BLUE]: {
			name: { src: '[HC] LobbyTeam Blue', meta: CampaignMeta.TEAM_BLUE_NAME },
			icon: { src: 'file://{images}/menu/missing-cover.png', meta: CampaignMeta.TEAM_BLUE_IMG },
			bgMusic: { src: '', meta: CampaignMeta.TEAM_RED_BG_MUSIC },
			bgMovie: { src: '', meta: CampaignMeta.TEAM_RED_BG_MOVIE },
			bgImage: { src: '', meta: CampaignMeta.TEAM_RED_BG_IMG },
		},
		[LobbyTeam.COUNT]: {
			name: { src: '[HC] INVALID TEAM MAX', meta: null },
			icon: { src: 'file://{images}/menu/missing-cover.png', meta: null },
			bgMusic: { src: '', meta: null },
			bgMovie: { src: '', meta: null },
			bgImage: { src: '', meta: null },
		}
	}

	// Icon used as a avatar for empty player slots in the lobby.
	static emptySlotAvatarSrc: string = 'file://{images}/menu/missing-cover.png';

	static onLoad() {
		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuSwitchReverse', false);
		$.DispatchEvent('MainMenuHideBackgroundImage', true);
		$.DispatchEvent('MainMenuHideBackgroundMovie');
		$.DispatchEvent('ChangeVersionInfoPosition', 2);

		$.RegisterForUnhandledEvent('MapUnloaded', () => {
			this.stopMusic();
			LobbyMenu.clientAssetsLoaded = false;
		});

		$.RegisterForUnhandledEvent('MainMenuModeRequestCleanup', () => {
			this.stopMusic();
			LobbyMenu.clientAssetsLoaded = false;
			$.DispatchEvent('ChangeVersionInfoPosition', 0);
		});

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_PlayerStateChanged',
			() => {
				this.updateUIState(); // TODO: This might change or be removed later since enter and left events will later work.
			}
		);

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_OnClientJoiningGame',
			() => {
				// closes out missing addons popup
				UiToolkitAPI.CloseAllVisiblePopups();
			}
		);

		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerJoined', this.playerJoin.bind(this));
		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerLeft', this.playerLeft.bind(this));

		this.lobbySettings = {
			hostName: FriendsAPI.GetLocalPlayerName(),
			tags: '',
			password: '',
			lan: false,
			cheats: false,
			allowClientInvites: false,
			visibility: LobbyVisibility.FRIENDS_ONLY,
			maxPlayers: 2,
			maxTeams: 2,
			requiredPlayers: 2,
			requiredNumTeamPlayers: 1,
			canSwitchTeams: false,
			hasSpectatorMode: false
		}

		this.campaignPair = CampaignAPI.FindCampaign(P2CELobbyAPI.GetCampaignID())!;
		if (this.campaignPair) {
			const basePath = getCampaignAssetPath(this.campaignPair);
			const getMetaSrc = (metaKey: CampaignMeta, addBasePath: boolean = true) => {
				const src = this.campaignPair.campaign.meta.get(metaKey);
				return src ? `${addBasePath ? basePath : ''}${src}` : undefined; // Don't want to override the value with a blank string, instead default to the default value set in the script.
			};

			$<Image>('#GameLogo')!.SetImage(getMetaSrc(CampaignMeta.FULL_LOGO) ?? 'file://{images}/logo.svg');

			for (let team = LobbyTeam.SPECTATOR; team < LobbyTeam.COUNT; team++) {
				const teamMeta = this.teamMeta[team];
				if (!teamMeta) continue;

				teamMeta.name.src = getMetaSrc(teamMeta.name.meta as CampaignMeta, false) ?? teamMeta.name.src;
				teamMeta.icon.src = getMetaSrc(teamMeta.icon.meta as CampaignMeta) ?? teamMeta.icon.src;
			};

			// Spectator does not have a specific set of assets, instead uses LobbyTeam Red's assets.
			// These assets do not have fall backs and will be blank if not specified.
			for (let team = LobbyTeam.RED; team < LobbyTeam.COUNT; team++) {
				const teamMeta = this.teamMeta[team];
				if (!teamMeta) continue;

				teamMeta.bgMusic.src = getMetaSrc(teamMeta.bgMusic.meta as CampaignMeta, false) ?? teamMeta.bgMusic.src;
				teamMeta.bgMovie.src = getMetaSrc(teamMeta.bgMovie.meta as CampaignMeta, false) ?? teamMeta.bgMovie.src;
				teamMeta.bgImage.src = getMetaSrc(teamMeta.bgImage.meta as CampaignMeta, false) ?? teamMeta.bgImage.src;
			};

			this.emptySlotAvatarSrc = getMetaSrc(CampaignMeta.EMPTY_SLOT_AVATAR_IMG) ?? this.emptySlotAvatarSrc;

			this.lobbySettings.maxPlayers = this.campaignPair.campaign.multiplayer_options.required_players; // TODO: Replace with proper max players KV3 KV.
			if (this.lobbySettings.maxPlayers < 2) {
				$.Warning(`Invalid max players set for "max_players" in campaign script! Defined: "${this.lobbySettings.maxPlayers}" Defaulting to "2"...`);
				this.lobbySettings.maxPlayers = 2;
			}

			this.lobbySettings.requiredPlayers = this.campaignPair.campaign.multiplayer_options.required_players;
			if (this.lobbySettings.requiredPlayers < 2) {
				$.Warning(`Invalid required player amount set for "required_players" in campaign script! Defined: "${this.lobbySettings.requiredPlayers}" Defaulting to "2"...`);
				this.lobbySettings.requiredPlayers = 2;
			}

			this.lobbySettings.maxTeams = parseInt(getMetaSrc(CampaignMeta.MAX_NUM_TEAMS, false) ?? '2');
			if (this.lobbySettings.maxTeams < 2) {
				$.Warning(`Invalid max amount of teams set for "max_num_teams" in campaign script! Defined: "${this.lobbySettings.maxTeams}" Defaulting to "2"...`);
				this.lobbySettings.maxTeams = 2;
			}

			this.lobbySettings.requiredNumTeamPlayers = parseInt(getMetaSrc(CampaignMeta.REQUIRED_NUM_TEAM_PLAYERS, false) ?? '1');
			if (this.lobbySettings.requiredNumTeamPlayers < 1) {
				$.Warning(`Invalid number of players required on each set for "required_num_team_players" in campaign script! Defined: "${this.lobbySettings.requiredNumTeamPlayers}" Defaulting to "1"...`);
				this.lobbySettings.requiredNumTeamPlayers = 1;
			}

			this.lobbySettings.canSwitchTeams = true; // (getMetaSrc(CampaignMeta.CAN_SWITCH_TEAMS, false) ?? 'false').toLowerCase() === 'true';
			this.lobbySettings.hasSpectatorMode = (getMetaSrc(CampaignMeta.HAS_SPECTATOR_MODE, false) ?? 'false').toLowerCase() === 'true';
			if (this.lobbySettings.hasSpectatorMode) {
				this.lobbySettings.maxTeams++; // Spectator is a team that the game can use.
			}

			$.Msg('------------------');
			$.Msg(`basePath: ${basePath}`);
			$.Msg('');
			$.Msg('Lobby Settings:');
			$.Msg(`maxPlayers: ${this.lobbySettings.maxPlayers}`);
			$.Msg(`requiredPlayers: ${this.lobbySettings.requiredPlayers}`);
			$.Msg(`maxTeams: ${this.lobbySettings.maxTeams}`);
			$.Msg(`requiredNumTeamPlayers: ${this.lobbySettings.requiredNumTeamPlayers}`);
			$.Msg(`canSwitchTeams: ${this.lobbySettings.canSwitchTeams}`);
			$.Msg(`hasSpectatorMode: ${this.lobbySettings.hasSpectatorMode}`);
			$.Msg(`emptySlotAvatarSrc: ${this.emptySlotAvatarSrc}`);
			$.Msg('LobbyTeam Names:');
			$.Msg(`${this.teamMeta[LobbyTeam.SPECTATOR].name.src}`);
			$.Msg(`${this.teamMeta[LobbyTeam.RED].name.src}`);
			$.Msg(`${this.teamMeta[LobbyTeam.BLUE].name.src}`);
			$.Msg('LobbyTeam Icon Src:');
			$.Msg(`${this.teamMeta[LobbyTeam.SPECTATOR].icon.src}`);
			$.Msg(`${this.teamMeta[LobbyTeam.RED].icon.src}`);
			$.Msg(`${this.teamMeta[LobbyTeam.BLUE].icon.src}`);
			$.Msg('LobbyTeam Music Src:');
			$.Msg(`${this.teamMeta[LobbyTeam.RED].bgMusic.src}`);
			$.Msg(`${this.teamMeta[LobbyTeam.BLUE].bgMusic.src}`);
			$.Msg('LobbyTeam Movie Src:');
			$.Msg(`${this.teamMeta[LobbyTeam.RED].bgMovie.src}`);
			$.Msg(`${this.teamMeta[LobbyTeam.BLUE].bgMovie.src}`);
			$.Msg('LobbyTeam Background Image Src:');
			$.Msg(`${this.teamMeta[LobbyTeam.RED].bgImage.src}`);
			$.Msg(`${this.teamMeta[LobbyTeam.BLUE].bgImage.src}`);
			$.Msg('------------------');
		}

		if (!P2CELobbyAPI.IsLobbyOwner()) {
			this.startButton.visible = false;
			this.lobbyManPanel.visible = false;

			if (this.lobbySettings.allowClientInvites) {
				this.clientInviteButton.visible = true;
			}
		}

		this.updateUIState();
		//LobbyManPanel.loadSubMenu('lobby-info');
	}

	// Separate from onLoad because some of what is loaded is based on what team the player is on. This function should be run after the player entry for the player is filled.
	static loadCampaignMenuAssets(team: LobbyTeam) {
		// Spectator will use team red's assets.
		if (team === LobbyTeam.SPECTATOR) team = LobbyTeam.RED;

		$.Msg('------------------');
		$.Msg('LobbyTeam Based Assets:');
		if (this.campaignPair) {
			const basePath = getCampaignAssetPath(this.campaignPair);

			const teamMeta = this.teamMeta[team];
			let bgMusic = teamMeta.bgMusic.src;
			let bgMovie = teamMeta.bgMovie.src;
			let bgImage = teamMeta.bgImage.src;

			// TODO-FIXME: This set of if statements is a bit jank, should be cleaned up but works for testing for now.
			const playMusic = () => {
				if (bgMusic) this.bgMusicID = $.PlaySoundEvent(bgMusic);
			};
			if (bgMovie) {
				$.DispatchEvent('MainMenuShowBackgroundMovie', `${bgMovie}`);
				playMusic();
			} else if (bgImage) {
				$.DispatchEvent('MainMenuShowBackgroundImage', `${bgImage}`, true);
				playMusic();
			} else {
				$.Msg('No team based menu background assets, falling back to standard meta keys...');
				const getMetaSrc = (metaKey: CampaignMeta, addBasePath: boolean = true) => {
					const src = this.campaignPair.campaign.meta.get(metaKey);
					return src ? `${addBasePath ? basePath : ''}${src}` : '';
				};
				// If team based music was found before, that should still be used, else use the standard meta key.
				bgMusic = (bgMusic.length > 0) ? bgMusic : getMetaSrc(CampaignMeta.BG_MUSIC, false);
				bgMovie = getMetaSrc(CampaignMeta.BG_MOVIE);
				bgImage = getMetaSrc(CampaignMeta.BG_IMG);

				if (bgMovie) {
					$.DispatchEvent('MainMenuShowBackgroundMovie', `${bgMovie}`);
					playMusic();
				} else if (bgImage) {
					$.DispatchEvent('MainMenuShowBackgroundImage', `${bgImage}`, true);
					playMusic();
				} else {
					$.Warning('CAMPAIGN MENU: No background has been specified! Fix this now!!!');
					$.Warning(
						`Fields:\nbgMusic = ${bgMusic}\nbgMovie = ${bgMovie}\nbgImage = ${bgImage}\nbasePath = ${basePath}`
					);
					$.DispatchEvent('MainMenuShowBackgroundImage', getRandomFallbackImage(), true);
				}
			}

			$.Msg(`bgMusic: ${bgMusic}`);
			$.Msg(`bgMovie: ${bgMovie}`);
			$.Msg(`bgImage: ${bgImage}`);
		}
		$.Msg('------------------');

		LobbyMenu.clientAssetsLoaded = true;
	}

	// TODO-FIXME: This should be reworked or removed as this entirely breaks having individual player states for teams and such if PlayerEntrys are remade.
	static updateUIState() {
		for (const [id, player] of this.lobbySlots) {
			player.destruct();
		}
		this.lobbySlots.clear();
		this.numPlayers = 0;
		for (const player of P2CELobbyAPI.GetPlayerList()) {
			this.lobbySlots.set(player.id, new PlayerEntry(player, (LobbyMenu.lobbySlots.size % 2 === 0) ? LobbyTeam.BLUE : LobbyTeam.RED)); // TODO-FIXME: This auto placement of teams will need to be rethought as there will be in the future functionality to switch teams.
		}
		this.numPlayers = this.lobbySlots.size;

		if (this.lobbySlots.size < this.lobbySettings.maxPlayers) {
			for (let slot = this.lobbySlots.size; slot < this.lobbySettings.maxPlayers; slot++) {
				this.lobbySlots.set(slot, new EmptyEntry(slot));
			}
		}

		// Update start button for when there is enough players.
		if (LobbyMenu.canStartGame()) {
			this.startButton.enabled = true;
		} else {
			this.startButton.enabled = false;
		}
	}

	static playerJoin(lobbyPlayer: LobbyPlayer) {
		$.Msg('Player joined!');
		$.Msg(`Player Name: ${lobbyPlayer.name}`);
		$.Msg(`Player SteamID: ${lobbyPlayer.id}`);
		this.lobbySlots.set(lobbyPlayer.id, new PlayerEntry(lobbyPlayer, (LobbyMenu.lobbySlots.size % 2 === 0) ? LobbyTeam.BLUE : LobbyTeam.RED)); // TODO-FIXME: This auto placement of teams will need to be rethought as there will be in the future functionality to switch teams.

		this.updateUIState();
	}

	static playerLeft(lobbyPlayer: LobbyPlayer) {
		$.Msg('Player left!');
		$.Msg(`Player Name: ${lobbyPlayer.name}`);
		$.Msg(`Player SteamID: ${lobbyPlayer.id}`);
		LobbyMenu.lobbySlots.get(lobbyPlayer.id)?.destruct();
		LobbyMenu.lobbySlots.delete(lobbyPlayer.id);

		this.updateUIState();
	}

	static requestExit() {
		$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Exit Lobby?',
			'[HC] Are you sure you want to disconnect from the current lobby?',
			'warning-popup',
			() => {
				if (this.bgMusicID) $.StopSoundEvent(this.bgMusicID);
				this.bgMusicID = undefined;
				P2CELobbyAPI.ExitLobby();
			},
			() => {}
		);
	}

	static startGame() {
		if (!P2CELobbyAPI.IsLobbyOwner()) {
			return;
		}
	}

	static startToolTipShow(show: boolean) {
		if (!this.startButton.enabled && show) {
			UiToolkitAPI.ShowTextTooltip('StartButton', $.Localize('[HC] The lobby does not have enough players to start!'));
		} else {
			UiToolkitAPI.HideTextTooltip();
		}
	}

	static stopMusic() {
		if (this.bgMusicID) $.StopSoundEvent(this.bgMusicID);
		this.bgMusicID = undefined;
	}

	static canStartGame(): boolean {

		// Requirements for the game to start:
		// 1. Lobby has enough players for the campaign.
		// 2. Each team has enough players for the campaign, ex. no 2v1 situations.

		if (this.numPlayers < this.lobbySettings.requiredPlayers)
			return false;
		else if (!enoughPlayersForGame())
			return false;

		return true;
	}

	/// DEBUG ///

	static dumpSlotList() {
		let slot = 0;
		this.lobbySlots.forEach(playerEntry => {
			$.Msg(`Slot: ${slot}`);
			if (playerEntry instanceof PlayerEntry) {
				$.Msg(`Player Name: ${playerEntry.playerInfo.lobbyPlayer.name}`);
				$.Msg(`Player SteamID: ${playerEntry.playerInfo.lobbyPlayer.id}`);
				$.Msg(`Player Is Host?: ${playerEntry.playerInfo.lobbyPlayer.owner}`);
				$.Msg(`Player Has All Required Addons?: ${playerEntry.playerInfo.hasAllAddons}`);
				$.Msg(`Player LobbyTeam: ${playerEntry.playerInfo.team}`);
				$.Msg('');
				slot++;
				return;
			}

			$.Msg('Empty slot...');
			$.Msg('');
			slot++;
		});
		$.Msg(`Total Players: ${this.numPlayers}`);
	}

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
}

class LobbyManPanel {

	static lobbyManPanelInsert: Panel = $('#LobbyManSubMenuInsert')!;
	static subMenuPanel: Panel;

	static loadSubMenu(submenuXML: string) {
		if (this.subMenuPanel) this.unloadCurSubMenu();
		$.Msg('LOADING SUBMENU!');
		this.subMenuPanel = $.CreatePanel('Panel', this.lobbyManPanelInsert, `LobbyManSubMenu_${submenuXML}`);
		this.subMenuPanel.LoadLayout(`file://{resources}/layout/pages/main-menu/lobby-menu-submenus/${submenuXML}.xml`, false, false);
	}

	static onLoadSubMenu() {
		$.Msg('LOADED SUBMENU!');
	}

	static unloadCurSubMenu() {
		$.Msg('UNLOADED SUBMENU!');
		if (this.subMenuPanel) {
			this.subMenuPanel.RemoveAndDeleteChildren();
			this.subMenuPanel.DeleteAsync(0);
		}
	}

	static retrieveBanList(): Array<steamID> {
		const banList = $.LoadKeyValues3File('cfg/lobbybans.kv3') as Record<string, Array<unknown>> as Record<string, Array<steamID>>;
		if (banList === undefined || banList.bans === undefined || !(banList.bans instanceof Array)) {
			return [];
		}

		return banList.bans;
	}
}
