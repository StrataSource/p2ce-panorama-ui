'use strict';

/**
 * Stored settings for the lobby.
 */
interface LobbySettings {
	hostName: string;
	tags: string;
	password: string;
	lan: boolean;
	cheats: boolean;

	allowClientInvites: boolean; // Allowing connected clients to issue lobby invites themselves.
	visibility: LobbyVisibility; // Visibility of the lobby through server browser and Steam API.
	maxPlayers: number;
	maxTeams: number;
	requiredPlayers: number; // TODO: Replace with CampaignMultiPlayerOptions version.
	requiredNumTeamPlayers: number; // TODO: Replace with CampaignMultiPlayerOptions version.
	canSwitchTeams: boolean; // TODO: Replace with CampaignMultiPlayerOptions version.
	allowSpectators: boolean;
}

/**
 * Information about the player that is slotted in the UI.
 */
interface PlayerInfo {
	lobbyPlayer: LobbyPlayer; // Server information about the player.
	hasAllAddons: boolean; // Does the player have the required installed addons?
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

/**
 * @brief Get number of players on a specific team.
 * @param team Team to get number of players on.
 * @returns Number of players
 */
function getNumPlayersOnTeam(team: LobbyTeam): number {
	if (!isValidTeam(team)) {
		//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
		throw new Error('Invalid team has been specified for getPlayersOnTeam!');
	}

	let numPlayers = 0;
	LobbyMenu.lobbySlots.forEach(slot => {
		if (!slot.playerInfo) return;

		if (slot.playerInfo.lobbyPlayer.team === team) numPlayers++;
	});

	return numPlayers;
}

/**
 * @brief Check if there are enough players to meet the minimum campaign requirement.
 * @returns True if there are enough players.
 */
function enoughPlayersForGame(): boolean {
	let teamCount = 0;
	for (let team = LobbyTeam.RED; team < LobbyTeam.COUNT; team++) {
		if (teamCount === LobbyMenu.lobbySettings.maxTeams) break;

		const numTeamPlayers = getNumPlayersOnTeam(team);
		if (numTeamPlayers < LobbyMenu.lobbySettings.requiredNumTeamPlayers)
			return false;

		teamCount++;
	}

	return true;
}

/**
 * @brief Check if all players are in the READY status.
 * @returns True if all players are ready.
 */
function allPlayersReady() : boolean {
	LobbyMenu.lobbySlots.forEach(slot => {
		if (slot.playerInfo?.lobbyPlayer.state !== LobbyMemberReadyState.READY)
			return false;
	});

	return true;
}

/**
 * Panel for a player slot.
 */
class PlayerEntry {

	playerEntryPanel: Panel;

	emptySlotAvatar: Image; // If no player occupies the slot this is used instead of AvatarImage.
	playerAvatar?: AvatarImage;
	playerInfo?: PlayerInfo;

	kickBtn?: Button;
	banBtn?: Button;
	steamProfileBtn?: Button;
	pnrStatus?: Image;
	paStatus?: AnimatedImageStrip;
	prStatus?: Image;

	hostIcon?: Image;
	steamFriendIcon?: Image;
	addonMissingNotice?: Panel;
	teamIcon?: Image;
	teamSwitchBtn?: Button;

	constructor(lobbyPlayer: LobbyPlayer | null) { //}, team: LobbyTeam) {
		const id: string = lobbyPlayer ? `playerslot_${lobbyPlayer.id}` : `playerslot_empty${LobbyMenu.numPlayers}`
		this.playerEntryPanel = $.CreatePanel('Panel', LobbyMenu.playerListPanel, id);
		this.playerEntryPanel.LoadLayoutSnippet('LobbyEntry');

		this.emptySlotAvatar = this.playerEntryPanel.FindChildTraverse('EmptyEntryAvatar')!;
		this.emptySlotAvatar.SetImage(LobbyMenu.emptySlotAvatarSrc);

		// Empty entries don't need everything else set up, so exit early.
		if (!lobbyPlayer) {
			this.playerEntryPanel.FindChildTraverse('PlayerEntry')!.visible = false;
			this.playerEntryPanel.FindChildTraverse('EmptyEntry')!.visible = true;
			return;
		}

		this.playerAvatar = this.playerEntryPanel.FindChildTraverse('PlayerAvatar')!;
		this.playerAvatar.steamid = lobbyPlayer.id;
		this.playerEntryPanel.SetDialogVariable('name', lobbyPlayer.name);

		this.playerInfo = {
			lobbyPlayer: lobbyPlayer,
			hasAllAddons: true, // TODO: Replace with a API function that checks if the user does in fact have needed addons/custom content.
		};


		if (!isValidTeam(this.playerInfo.lobbyPlayer.team)) {
			//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
			throw new Error('Invalid team has been specified for new PlayerEntry! This is not right, please report to P2:CE developers!');
		}

		const teamMeta = LobbyMenu.teamMeta[this.playerInfo.lobbyPlayer.team];

		this.playerEntryPanel.SetDialogVariable('teamName', teamMeta.name.src);

		this.kickBtn = this.playerEntryPanel.FindChildTraverse('KickBtn')!;
		this.kickBtn.SetPanelEvent('onactivate', this.kickPlayer.bind(this));

		this.banBtn = this.playerEntryPanel.FindChildTraverse('BanBtn')!;
		this.banBtn.SetPanelEvent('onactivate', this.banPlayer.bind(this));

		this.steamProfileBtn = this.playerEntryPanel.FindChildTraverse('SteamProfileBtn')!;
		this.steamProfileBtn.SetPanelEvent('onactivate', this.openSteamProfile.bind(this));

		this.pnrStatus = this.playerEntryPanel.FindChildTraverse('PlayerNotReadyStatus')!;
		this.paStatus = this.playerEntryPanel.FindChildTraverse('PlayerAddonStatus')!;
		this.prStatus = this.playerEntryPanel.FindChildTraverse('PlayerReadyStatus')!;``
		this.paStatus.visible = false;
		this.prStatus.visible = false;
		this.setStatusIndicator(this.playerInfo.lobbyPlayer.state);

		this.teamSwitchBtn = this.playerEntryPanel.FindChildTraverse('TeamSwitchBtn')!;
		this.teamSwitchBtn.SetPanelEvent('onactivate', this.teamSwitchContextMenu.bind(this));

		const isThisClientEntry = lobbyPlayer.id === UserAPI.GetXUID();

		this.kickBtn.visible = false;
		this.banBtn.visible = false;
		this.playerEntryPanel.SetPanelEvent('onmouseover', () => {
			if (!this.kickBtn || !this.banBtn) return;
			if (!P2CELobbyAPI.IsLobbyOwner || isThisClientEntry) return;

			this.kickBtn.visible = true;
			this.banBtn.visible = true;
		});
		this.playerEntryPanel.SetPanelEvent('onmouseout', () => {
			if (!this.kickBtn || !this.banBtn) return;

			this.kickBtn.visible = false;
			this.banBtn.visible = false;
		});

		this.teamSwitchBtn.enabled = false;
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
		if (isThisClientEntry) {
			LobbyMenu.loadCampaignMenuAssets(this.playerInfo.lobbyPlayer.team);
		}
	}

	destruct() {
		this.playerEntryPanel.RemoveAndDeleteChildren();
		this.playerEntryPanel.DeleteAsync(0);
	}

	kickPlayer() {
		$.Msg(`Kicked player: ${this.playerInfo!.lobbyPlayer.name} (${this.playerInfo!.lobbyPlayer.id})`);
		P2CELobbyAPI.KickPlayer(this.playerInfo!.lobbyPlayer.id, '[HC] Kicked by lobby host.');
	}

	banPlayer() {
		$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Are you sure?',
			`[HC] Are you sure you want to ban this user from the current lobby?` + `\nUsername: ${this.playerInfo!.lobbyPlayer.name}\nSteamID: ${this.playerInfo!.lobbyPlayer.id}`,
			'warning-popup',
			() => {
				$.Msg(`Banned player: ${this.playerInfo!.lobbyPlayer.name} (${this.playerInfo!.lobbyPlayer.id})`);
				P2CELobbyAPI.BanPlayer(this.playerInfo!.lobbyPlayer.id, '[HC] Banned by lobby host.');
			},
			() => {}
		);
	}

	openSteamProfile() {
		SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/profiles/${this.playerInfo!.lobbyPlayer.id}`);
	}

	setStatusIndicator(state: LobbyMemberReadyState) {
		// TODO-FIXME: Clean this up!
		switch (state) {
			case (LobbyMemberReadyState.NOT_READY): {
				this.pnrStatus!.visible = true;
				this.paStatus!.visible = false;
				this.prStatus!.visible = false;
				this.playerEntryPanel.SetDialogVariable('status', "[HC] Not Ready");
				break;
			}
			case (LobbyMemberReadyState.DOWNLOADING_ADDONS): {
				this.pnrStatus!.visible = false;
				this.paStatus!.visible = true;
				this.prStatus!.visible = false;
				this.playerEntryPanel.SetDialogVariable('status', "[HC] Downloading Addons");
				break;
			}
			case (LobbyMemberReadyState.READY): {
				this.pnrStatus!.visible = false;
				this.paStatus!.visible = false;
				this.prStatus!.visible = true;
				this.playerEntryPanel.SetDialogVariable('status', "[HC] Ready");
				break;
			}
			default: {
				$.Warning('Invalid state passed in setStatusIndicator. This shouldn\'t happen!');
				break;
			}
		}
	}

	switchTeam(newTeam: LobbyTeam, notify: boolean = true) {
		if (!isValidTeam(this.playerInfo!.lobbyPlayer.team)) {
			//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
			throw new Error('Invalid team has been specified for team switch! This is not right, please report to P2:CE developers!');
		}

		const newTeamMeta = LobbyMenu.teamMeta[newTeam];

		$.Msg(`Switching player team from "${LobbyMenu.teamMeta[this.playerInfo!.lobbyPlayer.team].name.src}" to "${newTeamMeta.name.src}"`);
		this.playerInfo!.lobbyPlayer.team = newTeam;
		this.teamIcon!.SetImage(newTeamMeta.icon.src);
		this.playerEntryPanel.SetDialogVariable('teamName', newTeamMeta.name.src);
		if (notify) P2CELobbyAPI.SetTeam(newTeam); // TODO: Break down setting the elements of a player slot into a separate function so this isn't needed.
	}

	teamSwitchContextMenu() {
		$.Msg('BRUH');
		const items: UiToolkitAPI.SimpleContextMenuItem[] = [];

		let teamCount = 0;
		for (let team = LobbyMenu.lobbySettings.allowSpectators ? LobbyTeam.SPECTATOR : LobbyTeam.RED; team < LobbyTeam.COUNT; team++) {
			if (teamCount === LobbyMenu.lobbySettings.maxTeams) break;

			const teamMeta = LobbyMenu.teamMeta[team];

			if (team !== this.playerInfo!.lobbyPlayer.team) {
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

class LobbyMenu {

	static lobbySettings: LobbySettings;

	static lobbySlots: Map<steamID | number, PlayerEntry> = new Map;
	static numPlayers: number = 0;

	static playerListPanel = $<Panel>('#PlayerList')!;
	static lobbyManPanel = $<Panel>('#LobbyManPanel')!;
	static gameLogo = $<Image>('#GameLogo')!;

	static clientInviteButton = $<Button>('#ClientInviteButton')!;
	static clientReadyButton = $<Button>('#ClientReadyButton')!;
	static clientReadyButtonText = $<Label>('#ClientReadyButtonText')!;

	static bgMusicID: uuid | undefined = undefined;
	static campaignPair: CampaignPair;
	static lobbyData: LobbyData;

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
		});

		$.RegisterForUnhandledEvent('MainMenuModeRequestCleanup', () => {
			this.stopMusic();
			$.DispatchEvent('ChangeVersionInfoPosition', 0);
		});

		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_LobbyStateChanged', (metadata: LobbyData) => {
			const prevCampaign = this.lobbyData.campaign;
			this.lobbyData = metadata;

			$.Msg('New Lobby State:');
			$.Msg(`Campaign ID: ${this.lobbyData.campaign}`);
			$.Msg(`Chapter Name: ${this.lobbyData.chapter}`);
			$.Msg(`Map Index: ${this.lobbyData.map}`);
			$.Msg(`Lobby State: ${this.lobbyData.state}`);

			this.campaignPair = CampaignAPI.FindCampaign(this.lobbyData.campaign)!;
			const pEntry = this.getLocalPlayerEntry();
			$.Msg(`campaign: ${this.lobbyData.campaign}`);
			$.Msg(`prev campaign: ${prevCampaign}`);

			if (pEntry && pEntry.playerInfo && this.lobbyData.campaign !== prevCampaign) {
				$.Msg(`update campaign`);
				LobbyMenu.loadCampaignMenuAssets(pEntry.playerInfo.lobbyPlayer.team);
			}
		});

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_PlayerStateChanged',
			(who: steamID, lobbyPlayer: LobbyPlayer) => {
				$.Msg(`UPDATE PLAYER STATE`);
				if (!lobbyPlayer || who.length === 0) {
					$.Warning("No valid LobbyPlayer or SteamID was given for PlayerStateChanged.");
					return;
				}

				const playerEntry = this.lobbySlots.get(who);
				if (!playerEntry) {
					$.Warning("No valid LobbyPlayer or SteamID was given for PlayerStateChanged.");
					return;
				}
				if (!playerEntry.playerInfo) {
					$.Warning("No PlayerInfo int PlayerEntry for PlayerStateChanged! This shouldn't happen unless a EmptyEntry was targeted?");
					return;
				}
				const team = playerEntry.playerInfo.lobbyPlayer.team;
				playerEntry.playerInfo.lobbyPlayer = lobbyPlayer;
				this.lobbySlots.set(who, playerEntry);

				if (playerEntry.playerInfo.lobbyPlayer.team != team)
					playerEntry.switchTeam(playerEntry.playerInfo.lobbyPlayer.team, false);

				const state = playerEntry.playerInfo.lobbyPlayer.state;
				$.Msg(`NEW STATE: ${state}`);
				if (playerEntry.playerInfo.lobbyPlayer.id === UserAPI.GetXUID())
				{
					this.clientReadyButton.SetHasClass('button--red', state === LobbyMemberReadyState.NOT_READY);
					this.clientReadyButton.SetHasClass('button--yellow', state === LobbyMemberReadyState.DOWNLOADING_ADDONS);
					this.clientReadyButton.SetHasClass('button--green', state === LobbyMemberReadyState.READY);
					switch (state) {
						case (LobbyMemberReadyState.NOT_READY): {
							this.clientReadyButtonText.text = "[HC] Not Ready";
							break;
						}
						case (LobbyMemberReadyState.DOWNLOADING_ADDONS): {
							this.clientReadyButtonText.text = "[HC] Downloading Addons..."
							break;
						}
						case (LobbyMemberReadyState.READY): {
							this.clientReadyButtonText.text = "[HC] Ready"
							break;
						}
						default:
							break;
					}
				}

				playerEntry.setStatusIndicator(state);
			}
		)

		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerJoined', this.playerJoin.bind(this));
		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerLeft', this.playerLeft.bind(this));


		// Lobby settings defaults
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
			allowSpectators: false,
		}

		this.lobbyData = {
			state: LobbyState.INVALID,
			campaign: "",
			chapter: "",
			map: 0
		}

		this.campaignPair = CampaignAPI.FindCampaign(P2CELobbyAPI.GetCampaignID())!;
		if (this.campaignPair) {
			const basePath = getCampaignAssetPath(this.campaignPair);
			const getMetaSrc = (metaKey: CampaignMeta, addBasePath: boolean = true) => {
				const src = this.campaignPair.campaign.meta.get(metaKey);
				return src ? `${addBasePath ? basePath : ''}${src}` : undefined; // Don't want to override the value with a blank string, instead default to the default value set in the script.
			};

			this.gameLogo.SetImage(getMetaSrc(CampaignMeta.FULL_LOGO) ?? getRandomFallbackImage());

			for (let team = LobbyTeam.SPECTATOR; team < LobbyTeam.COUNT; team++) {
				const teamMeta = this.teamMeta[team];
				if (!teamMeta) continue;

				teamMeta.name.src = getMetaSrc(teamMeta.name.meta!, false) ?? teamMeta.name.src;
				teamMeta.icon.src = getMetaSrc(teamMeta.icon.meta!) ?? teamMeta.icon.src;
			};

			// Spectator does not have a specific set of assets, instead uses LobbyTeam Red's assets.
			// These assets do not have fall backs and will be blank if not specified.
			for (let team = LobbyTeam.RED; team < LobbyTeam.COUNT; team++) {
				const teamMeta = this.teamMeta[team];
				if (!teamMeta) continue;

				teamMeta.bgMusic.src = getMetaSrc(teamMeta.bgMusic.meta!, false) ?? teamMeta.bgMusic.src;
				teamMeta.bgMovie.src = getMetaSrc(teamMeta.bgMovie.meta!, false) ?? teamMeta.bgMovie.src;
				teamMeta.bgImage.src = getMetaSrc(teamMeta.bgImage.meta!, false) ?? teamMeta.bgImage.src;
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

			this.lobbySettings.canSwitchTeams = (getMetaSrc(CampaignMeta.CAN_SWITCH_TEAMS, false) ?? 'false').toLowerCase() === 'true';
			this.lobbySettings.allowSpectators = (getMetaSrc(CampaignMeta.HAS_SPECTATOR_MODE, false) ?? 'false').toLowerCase() === 'true';
			if (this.lobbySettings.allowSpectators) {
				this.lobbySettings.maxTeams++; // Spectator is a team that the game can use.
			}

			if (GameInterfaceAPI.GetSettingBool('developer')) {
				$.Msg('------------------');
				$.Msg(`basePath: ${basePath}`);
				$.Msg('');
				$.Msg('Lobby Settings:');
				$.Msg(`maxPlayers: ${this.lobbySettings.maxPlayers}`);
				$.Msg(`requiredPlayers: ${this.lobbySettings.requiredPlayers}`);
				$.Msg(`maxTeams: ${this.lobbySettings.maxTeams}`);
				$.Msg(`requiredNumTeamPlayers: ${this.lobbySettings.requiredNumTeamPlayers}`);
				$.Msg(`canSwitchTeams: ${this.lobbySettings.canSwitchTeams}`);
				$.Msg(`hasSpectatorMode: ${this.lobbySettings.allowSpectators}`);
				$.Msg(`emptySlotAvatarSrc: ${this.emptySlotAvatarSrc}`);
				$.Msg('------------------');
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
		}

		this.clientInviteButton.visible = true;
		if (!P2CELobbyAPI.IsLobbyOwner() && this.lobbySettings.allowClientInvites)
			this.clientInviteButton.visible = true;

		this.updateUIState();
		LobbyManPanel.onLoad();
	}

	// Separate from onLoad because some of what is loaded is based on what team the player is on. This function should be run after the player entry for the player is filled.
	static loadCampaignMenuAssets(team: LobbyTeam) {
		this.stopMusic();

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
	}

	// TODO-FIXME: This should be reworked or removed as this entirely breaks having individual player states for teams and such if PlayerEntrys are remade.
	static updateUIState() {
		for (const [id, player] of this.lobbySlots) {
			player.destruct();
		}
		this.lobbySlots.clear();
		this.numPlayers = 0;
		for (const player of P2CELobbyAPI.GetPlayerList()) {
			this.lobbySlots.set(player.id, new PlayerEntry(player));//, (LobbyMenu.lobbySlots.size % 2 === 0) ? LobbyTeam.BLUE : LobbyTeam.RED)); // TODO-FIXME: This auto placement of teams will need to be rethought as there will be in the future functionality to switch teams.
		}
		this.numPlayers = this.lobbySlots.size;

		if (this.lobbySlots.size < this.lobbySettings.maxPlayers) {
			for (let slot = this.lobbySlots.size; slot < this.lobbySettings.maxPlayers; slot++) {
				this.lobbySlots.set(slot, new PlayerEntry(null));//, LobbyTeam.ANY));
			}
		}
	}

	static playerJoin(lobbyPlayer: LobbyPlayer) {
		$.Msg('Player joined!');
		$.Msg(`Player Name: ${lobbyPlayer.name}`);
		$.Msg(`Player SteamID: ${lobbyPlayer.id}`);
		this.campaignPair.campaign.meta
		this.lobbySlots.set(lobbyPlayer.id, new PlayerEntry(lobbyPlayer));//, (LobbyMenu.lobbySlots.size % 2 === 0) ? LobbyTeam.BLUE : LobbyTeam.RED)); // TODO-FIXME: This auto placement of teams will need to be rethought as there will be in the future functionality to switch teams.
		// TODO: Make this find the first empty and entry is can find and replace it so this.updateUIState() isn't used.

		this.updateUIState();
	}

	static playerLeft(player: steamID) {
		$.Msg('Player left!');
		$.Msg(`Player SteamID: ${player}`);
		LobbyMenu.lobbySlots.get(player)?.destruct();
		LobbyMenu.lobbySlots.delete(player);

		// TODO: Make this replace the player entry with a empty entry so this.updateUIState() isn't used.


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

	static stopMusic() {
		if (this.bgMusicID) $.StopSoundEvent(this.bgMusicID);
		this.bgMusicID = undefined;
	}

	static canStartGame(): boolean {

		// Requirements for the game to start:
		// 1. Lobby has enough players for the campaign.
		// 2. Each team has enough players for the campaign, ex. no 2v1 situations.
		// 3. Players are readied up and all players have installed addons.

		if (this.numPlayers < this.lobbySettings.requiredPlayers)
			return false;
		else if (!enoughPlayersForGame())
			return false;
		else if (!allPlayersReady())
			return false;

		return true;
	}

	static getLocalPlayerEntry(): PlayerEntry | undefined {
		return this.lobbySlots.get(UserAPI.GetXUID());
	}

	static getLobbySettings(): LobbySettings {
		return this.lobbySettings;
	}

	static getLobbyPlayerCount(): number {
		return this.numPlayers;
	}


	static ToggleReadyState() {

		const entry = this.getLocalPlayerEntry();
		if (!entry || !entry.playerInfo)
		{
			$.Warning('No local player entry or player info to toggle the ready state of???');
			return;
		}

		const playerState = entry.playerInfo.lobbyPlayer.state;
		// $.Msg(`Player State Pre-Update: ${playerState}`);

		if (playerState === LobbyMemberReadyState.NOT_READY)
			P2CELobbyAPI.SetReadyStatus(true);
		else if (playerState === LobbyMemberReadyState.READY)
			P2CELobbyAPI.SetReadyStatus(false);
		else if (playerState === LobbyMemberReadyState.DOWNLOADING_ADDONS)
			return; // Don't do anything if player is currently downloading addons.
	}

	/// DEBUG ///

	static dumpSlotList() {
		let slot = 0;
		this.lobbySlots.forEach(playerEntry => {
			$.Msg(`Slot: ${slot}`);
			if (playerEntry.playerInfo) {
				$.Msg(`Player Name: ${playerEntry.playerInfo.lobbyPlayer.name}`);
				$.Msg(`Player SteamID: ${playerEntry.playerInfo.lobbyPlayer.id}`);
				$.Msg(`Player Is Host?: ${playerEntry.playerInfo.lobbyPlayer.owner}`);
				$.Msg(`Player Has All Required Addons?: ${playerEntry.playerInfo.hasAllAddons}`);
				$.Msg(`Player LobbyTeam: ${playerEntry.playerInfo.lobbyPlayer.team}`);
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
}

type LobbyManSubMenus = 'lobby-info' | 'lobby-settings' | 'lobby-bans' | 'lobby-chat' | 'lobby-dev';

class LobbyManPanel {

	static lobbyManPanelInsert: Panel = $('#LobbyManSubMenuInsert')!;
	static subMenuPanel: Panel;

	static infoTabButton: RadioButton = $<RadioButton>('#LobbyInfoMenuButton')!;
	static settingsTavButton: RadioButton = $<RadioButton>('#LobbySettingsMenuButton')!;
	static banTabButton: RadioButton = $<RadioButton>('#LobbyBanListMenuButton')!;
	static chatTabButton: RadioButton = $<RadioButton>('#LobbyChatMenuButton')!;
	static devTabButton: RadioButton = $<RadioButton>('#LobbyDevMenuButton')!;

	static onLoad() {
		if (GameInterfaceAPI.GetSettingBool('developer')) this.devTabButton.visible = true;
		if (P2CELobbyAPI.IsLobbyOwner()) {
			this.infoTabButton.visible = true;
			this.infoTabButton.SetSelected(true);
			this.loadSubMenu('lobby-info');
			this.settingsTavButton.visible = true;
			this.banTabButton.visible = true;
		} else {
			this.chatTabButton.SetSelected(true);
			this.loadSubMenu('lobby-chat');
		}

		this.infoTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu('lobby-info') });
		this.settingsTavButton.SetPanelEvent('onactivate', () => { this.loadSubMenu(`lobby-settings`) });
		this.banTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu(`lobby-bans`) });
		this.chatTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu(`lobby-chat`) });
		this.devTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu(`lobby-dev`) });
	}

	static loadSubMenu(submenuXML: LobbyManSubMenus) {
		if (this.subMenuPanel) this.unloadCurSubMenu();
		this.subMenuPanel = $.CreatePanel('Panel', this.lobbyManPanelInsert, `LobbyManSubMenu_${submenuXML}`);
		this.subMenuPanel.LoadLayout(`file://{resources}/layout/pages/main-menu/lobby-menu-submenus/${submenuXML}.xml`, false, false);
	}

	static unloadCurSubMenu() {
		this.subMenuPanel.RemoveAndDeleteChildren();
		this.subMenuPanel.DeleteAsync(0);
	}
}
