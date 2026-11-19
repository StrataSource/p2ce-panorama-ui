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

	maxPlayers: number; // Maximum number of players that can be in the lobby.
	requiredPlayers: number; // Minimum number of players required to start.
	allowSplitscreen: boolean; // If split-screen should be allowed with this campaign.
	waitForPlayers: boolean; // Wait for another player to join before the game progresses. Ex. Waiting for coop partner behavior.
	maxNumTeams: number; // Maximum number of teams that players can be on.
	defaultTeam: LobbyTeam; // Default team that the first player is set on before next player joining goes to another team.
	requiredNumTeamPlayers: number; // Minimum number of players on each team required to start.
	canSwitchTeams: boolean; // If other players than the host can switch teams.

	allowSpectators: boolean; // If the campaign allows players in it to join the spectator team. // TODO: Not implemented engine side.
}

/**
 * Interface for the global stored object containing information about the current lobby.
 */
interface LobbyInfo {
	lobbySlots: Map<steamID | number, PlayerEntry>;
	lobbySettings: LobbySettings;
	lobbyData: LobbyData;
}

type TeamAssetKey = 'name' | 'icon' | 'bgMusic' | 'bgMovie' | 'bgImage';
type TeamAssets = Record<TeamAssetKey, string>;
type TeamMetaKeys = Partial<Record<TeamAssetKey, CampaignMeta>>;

const DEFAULT_ICON = 'file://{images}/menu/missing-cover.png';
const setTeamDefaults = (name: string): TeamAssets => ({ name, icon: DEFAULT_ICON, bgMusic: '', bgMovie: '', bgImage: '' });

// Defaults for team assets.
const DEFAULT_TEAM_ASSETS: Readonly<Record<LobbyTeam, TeamAssets>> = {
	[LobbyTeam.ANY]: setTeamDefaults('[HC] Any'),
	[LobbyTeam.SPECTATOR]: setTeamDefaults('[HC] Spectator'),
	[LobbyTeam.RED]: setTeamDefaults('[HC] Red Team'),
	[LobbyTeam.BLUE]: setTeamDefaults('[HC] Blue Team'),
	[LobbyTeam.COUNT]: setTeamDefaults('INVALID!!! LobbyTeam.COUNT! THIS SHOULDN\'T BE HERE!'),
};

// Used to map the various assets to their respective CampaignMeta keys for each team.
const TEAM_META_KEYS: Readonly<Partial<Record<LobbyTeam, TeamMetaKeys>>> = {
	// Spectator will inherit the BG values from the Red team.
	[LobbyTeam.SPECTATOR]: {
		name: CampaignMeta.TEAM_SPECTATOR_NAME, icon: CampaignMeta.TEAM_SPECTATOR_IMG
	},
	[LobbyTeam.RED]: {
		name: CampaignMeta.TEAM_RED_NAME, icon: CampaignMeta.TEAM_RED_IMG,
		bgMusic: CampaignMeta.TEAM_RED_BG_MUSIC, bgMovie: CampaignMeta.TEAM_RED_BG_MOVIE, bgImage: CampaignMeta.TEAM_RED_BG_IMG,
	},
	[LobbyTeam.BLUE]: {
		name: CampaignMeta.TEAM_BLUE_NAME, icon: CampaignMeta.TEAM_BLUE_IMG,
		bgMusic: CampaignMeta.TEAM_BLUE_BG_MUSIC, bgMovie: CampaignMeta.TEAM_BLUE_BG_MOVIE, bgImage: CampaignMeta.TEAM_BLUE_BG_IMG,
	},
};

// Which assets should get the addon base path appended.
const PREFIXED_WITH_BASE: ReadonlySet<TeamAssetKey> = new Set(['icon', 'bgMovie', 'bgImage']);

// Pull from the meta key defined for the campaign. prefixBasePath is used for some keys that need the addon relative directory.
function readCampaignMeta(pair: CampaignPair, key: CampaignMeta | undefined, prefixBasePath: boolean): string | undefined {
	if (key === undefined)
		return undefined;

	const value = pair.campaign.meta.get(key);
	if (!value)
		return undefined; // Will fall back to the default if CampaignMeta key is not set.

	return prefixBasePath ? `${getCampaignAssetPath(pair)}${value}` : value;
}

// Called whenever the campaign changes to retrieve the assets for the team.
function resolveTeamAssets(pair: CampaignPair): Record<LobbyTeam, TeamAssets> {
	const teamAssets = {} as Record<LobbyTeam, TeamAssets>;

	for (const team of Object.keys(DEFAULT_TEAM_ASSETS).map(Number) as LobbyTeam[]) {

		const defaults: TeamAssets = DEFAULT_TEAM_ASSETS[team];
		const keys: TeamMetaKeys = TEAM_META_KEYS[team] ?? {};
		const assetsForTeam: TeamAssets = { ...defaults }; // Always starts from the defaults, never from the previous campaign to prevent any accidental overlap of assets.

		for (const key of Object.keys(defaults) as TeamAssetKey[]) {
			assetsForTeam[key] = readCampaignMeta(pair, keys[key], PREFIXED_WITH_BASE.has(key)) ?? defaults[key];
		}

		teamAssets[team] = assetsForTeam;
	}

	return teamAssets;
}

const READY_STATE_UI: Readonly<Record<LobbyMemberReadyState, Record<string, string>>> = {
	[LobbyMemberReadyState.NOT_READY]:          { text: '[HC] Not Ready',             btnClass: 'button--red'    },
	[LobbyMemberReadyState.DOWNLOADING_ADDONS]: { text: '[HC] Downloading Addons...', btnClass: 'button--yellow' },
	[LobbyMemberReadyState.READY]:              { text: '[HC] Ready',                 btnClass: 'button--green'  },
};

const READY_BTN_CLASSES: ReadonlyArray<string> = ['button--red', 'button--yellow', 'button--green'];

// TODO: Can probably remove since engine enforces what teams player can be on.
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

//#region commented out ready state code

/**
 * @brief Get number of players on a specific team.
 * @param team Team to get number of players on.
 * @returns Number of players
 */
// function getNumPlayersOnTeam(team: LobbyTeam): number {
// 	if (!isValidTeam(team)) {
// 		//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
// 		throw new Error('Invalid team has been specified for getPlayersOnTeam!');
// 	}

// 	let numPlayers = 0;
// 	LobbyMenu.lobbyInfo.lobbySlots.forEach(slot => {
// 		if (!slot.lobbyPlayer) return;

// 		if (slot.lobbyPlayer.team === team) numPlayers++;
// 	});

// 	return numPlayers;
// }

/**
 * @brief Check if there are enough players to meet the minimum campaign requirement.
 * @returns True if there are enough players.
 */
// function enoughPlayersForGame(): boolean {
// 	let teamCount = 0;
// 	for (let team = LobbyTeam.RED; team < LobbyTeam.COUNT; team++) {
// 		if (teamCount === LobbyMenu.lobbyInfo.lobbySettings.maxNumTeams) break;

// 		const numTeamPlayers = getNumPlayersOnTeam(team);
// 		if (numTeamPlayers < LobbyMenu.lobbyInfo.lobbySettings.requiredNumTeamPlayers)
// 			return false;

// 		teamCount++;
// 	}

// 	return true;
// }

/**
 * @brief Check if all players are in the READY status.
 * @returns True if all players are ready.
 */
// function allPlayersReady() : boolean {
// 	LobbyMenu.lobbyInfo.lobbySlots.forEach(slot => {
// 		if (slot.lobbyPlayer?.state !== LobbyMemberReadyState.READY)
// 			return false;
// 	});

// 	return true;
// }

// LobbyMenu
	// static canStartGame(): boolean {

	// 	// Requirements for the game to start:
	// 	// 1. Lobby has enough players for the campaign.
	// 	// 2. Each team has enough players for the campaign, ex. no 2v1 situations.
	// 	// 3. Players are readied up and all players have installed addons.

	// 	if (this.numPlayers < this.lobbySettings.requiredPlayers)
	// 		return false;
	// 	else if (!enoughPlayersForGame())
	// 		return false;
	// 	else if (!allPlayersReady())
	// 		return false;

	// 	return true;
	// }

//#endregion


/**
 * Panel for a player slot.
 */
class PlayerEntry {

	playerEntryPanel: Panel;

	emptySlotAvatar: Image; // If no player occupies the slot this is used instead of AvatarImage.
	playerAvatar?: AvatarImage;
	lobbyPlayer?: LobbyPlayer;

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

	constructor(lobbyPlayer: LobbyPlayer | null, slotIndex: number) {
		const id: string = lobbyPlayer ? `playerslot_${lobbyPlayer.id}` : `playerslot_empty${slotIndex}`
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

		this.lobbyPlayer = lobbyPlayer;
		this.lobbyPlayer.team = (LobbyMenu.lobbyInfo.lobbySlots.size % 2 === 0) ? LobbyTeam.BLUE : LobbyTeam.RED; // TODO: IMPLEMENT DEFAULT_TEAM PROPERLY! //LobbyMenu.lobbyInfo.lobbySettings.defaultTeam;
		this.playerAvatar = this.playerEntryPanel.FindChildTraverse('PlayerAvatar')!;
		this.playerAvatar.steamid = this.lobbyPlayer.id;
		this.playerEntryPanel.SetDialogVariable('name', this.lobbyPlayer.name);

		// TODO: Can probably get rid of this since team is enforced by the engine.
		if (!isValidTeam(this.lobbyPlayer.team)) {
			//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
			throw new Error('Invalid team has been specified for new PlayerEntry! This is not right, please report to P2:CE developers!');
		}

		this.teamSwitchBtn = this.playerEntryPanel.FindChildTraverse('TeamSwitchBtn')!;
		this.teamSwitchBtn.SetPanelEvent('onactivate', this.teamSwitchContextMenu.bind(this));

		this.steamProfileBtn = this.playerEntryPanel.FindChildTraverse('SteamProfileBtn')!;
		this.steamProfileBtn.SetPanelEvent('onactivate', () => { OpenSteamProfilePageFromID(this.lobbyPlayer!.id) });

		this.pnrStatus = this.playerEntryPanel.FindChildTraverse('PlayerNotReadyStatus')!;
		this.paStatus = this.playerEntryPanel.FindChildTraverse('PlayerAddonStatus')!;
		this.prStatus = this.playerEntryPanel.FindChildTraverse('PlayerReadyStatus')!;
		this.setStatusIndicator(this.lobbyPlayer.state); // Will set the state of the status icons.

		this.kickBtn = this.playerEntryPanel.FindChildTraverse('KickBtn')!;
		this.kickBtn.SetPanelEvent('onactivate', this.kickPlayer.bind(this));

		this.banBtn = this.playerEntryPanel.FindChildTraverse('BanBtn')!;
		this.banBtn.SetPanelEvent('onactivate', this.banPlayer.bind(this));

		this.kickBtn.visible = false;
		this.banBtn.visible = false;
		this.playerEntryPanel.SetPanelEvent('onmouseover', () => {
			if (!this.kickBtn || !this.banBtn)
				return;
			if (!P2CELobbyAPI.IsLobbyOwner() || this.lobbyPlayer!.id === UserAPI.GetXUID())
				return;

			this.kickBtn.visible = true;
			this.banBtn.visible = true;
		});
		this.playerEntryPanel.SetPanelEvent('onmouseout', () => {
			if (!this.kickBtn || !this.banBtn)
				return;
			if (!P2CELobbyAPI.IsLobbyOwner())
				return;

			this.kickBtn.visible = false;
			this.banBtn.visible = false;
		});

		this.teamSwitchBtn.enabled = false;
		if (LobbyMenu.lobbyInfo.lobbySettings.canSwitchTeams)
			this.teamSwitchBtn.enabled = true;

		this.hostIcon = this.playerEntryPanel.FindChildTraverse('HostPlayerIcon')!;
		this.steamFriendIcon = this.playerEntryPanel.FindChildTraverse('SteamFriendIcon')!;
		this.teamIcon = this.playerEntryPanel.FindChildTraverse('TeamIcon')!;

		if (lobbyPlayer.owner)
			this.hostIcon.visible = true;

		this.updateTeamMeta();
	}

	destructor() {
		// Prevent Panorama errors for the kick and ban buttons lingering around on player entry destruction.
		this.playerEntryPanel.ClearPanelEvent('onmouseover');
		this.playerEntryPanel.ClearPanelEvent('onmouseout');
		this.playerEntryPanel.RemoveAndDeleteChildren();
		this.playerEntryPanel.DeleteAsync(0);
	}

	updateTeamMeta() {
		if (!this.lobbyPlayer)
			return;

		const assets = LobbyMenu.getTeamAssets(this.lobbyPlayer.team);
		this.playerEntryPanel.SetDialogVariable('teamName', assets.name);
		this.teamIcon!.SetImage(assets.icon);

		//this.emptySlotAvatar.SetImage(LobbyMenu.emptySlotAvatarSrc);
	}

	setStatusIndicator(state: LobbyMemberReadyState) {
		if (!this.lobbyPlayer)
			return;

		if (GameInterfaceAPI.GetSettingBool('developer'))
			$.Msg(`LobbyMemberReadyState Changed!: ${state} SteamID: ${this.lobbyPlayer!.id}`);

		const ui = READY_STATE_UI[state];
		if (!ui) {
			$.Warning("Invalid state passed in setStatusIndicator. This shouldn't happen!");
			return;
		}

		this.pnrStatus!.visible = state === LobbyMemberReadyState.NOT_READY;
		this.paStatus!.visible = state === LobbyMemberReadyState.DOWNLOADING_ADDONS;
		this.prStatus!.visible = state === LobbyMemberReadyState.READY;
		this.playerEntryPanel.SetDialogVariable('status', ui.text);
	}

	kickPlayer() {
		if (this.lobbyPlayer!.id === UserAPI.GetXUID() || this.lobbyPlayer!.owner) {
			$.Warning('Tried to kick self or host, stop that!');
			return;
		}

		$.Msg(`Kicked player: ${this.lobbyPlayer!.name} (${this.lobbyPlayer!.id})`);
		P2CELobbyAPI.KickPlayer(this.lobbyPlayer!.id, '[HC] Kicked by lobby host.');
		$.DispatchEvent('P2CELobby_PlayerKicked', this.lobbyPlayer!.id);
	}

	banPlayer() {
		if (this.lobbyPlayer!.id === UserAPI.GetXUID() || this.lobbyPlayer!.owner) {
			$.Warning('Tried to ban self or host, stop that!');
			return;
		}

		$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
		// TODO: Allow the host to be able to input a custom ban message.
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Are you sure?',
			'[HC] Are you sure you want to ban this user from the current lobby?' + `\nUsername: ${this.lobbyPlayer!.name}\nSteamID: ${this.lobbyPlayer!.id}`,
			'warning-popup',
			() => {
				$.Msg(`Banned player: ${this.lobbyPlayer!.name} (${this.lobbyPlayer!.id})`);
				P2CELobbyAPI.BanPlayer(this.lobbyPlayer!.id, '[HC] Banned by lobby host.');
				$.DispatchEvent('P2CELobby_PlayerBanned', this.lobbyPlayer!.id);
			},
			() => {}
		);
	}

	switchTeam(newTeam: LobbyTeam) {
		if (!isValidTeam(newTeam)) {
			//! It is intentional that the code must error out completely if a invalid team is set for players. This represents a issue with the Panorama or backend code, and hopefully caused by nothing user facing.
			throw new Error('Invalid team has been specified for team switch! This is not right, please report to P2:CE developers!');
		}

		this.lobbyPlayer!.team = newTeam;
		this.updateTeamMeta();
		P2CELobbyAPI.SetTeam(this.lobbyPlayer!.id, newTeam);
	}

	teamSwitchContextMenu() {
		const settings = LobbyMenu.lobbyInfo.lobbySettings;
		const items: UiToolkitAPI.SimpleContextMenuItem[] = [];
		const first = settings.allowSpectators ? LobbyTeam.SPECTATOR : LobbyTeam.RED;

		for (let team = first; team < first + settings.maxNumTeams; team++) {
			if (team === this.lobbyPlayer!.team)
				continue;

			const assets = LobbyMenu.teamAssets[team];
			items.push({
				label: assets.name,
				jsCallback: () => this.switchTeam(team),
				icon: assets.icon,
			});
		}

		UiToolkitAPI.ShowSimpleContextMenu('', '', items);
	}
}

class LobbyMenu {

	static playerListPanel = $<Panel>('#PlayerList')!;
	static lobbyManPanel = $<Panel>('#LobbyManPanel')!;
	static gameLogo = $<Image>('#GameLogo')!;

	static clientInviteButton = $<Button>('#ClientInviteButton')!;
	static clientReadyButton = $<Button>('#ClientReadyButton')!;
	static clientReadyButtonText = $<Label>('#ClientReadyButtonText')!;

	static lobbyInfo: LobbyInfo;
	static bgMusicID: uuid | undefined = undefined;
	static campaignPair: CampaignPair;
	static teamAssets: Record<LobbyTeam, TeamAssets> = { ...DEFAULT_TEAM_ASSETS };
	// Icon used as a avatar for empty player slots in the lobby.
	static emptySlotAvatarSrc: string = 'file://{images}/menu/missing-cover.png';

	//#region Helpers

	public static getTeamAssets(team: LobbyTeam): TeamAssets {
		return this.teamAssets[team];
	}

	public static getLocalLobbyPlayer(): LobbyPlayer | undefined {
		return this.lobbyInfo.lobbySlots.get(UserAPI.GetXUID())?.lobbyPlayer;
	}

	private static stopMusic() {
		if (this.bgMusicID)
			$.StopSoundEvent(this.bgMusicID);

		this.bgMusicID = undefined;
	}

	// Used when processing campaign multiplayer options to make sure a setting is in bounds.
	private static clampOption(value: number, field: string, { min = -Infinity, max = Infinity }: { min?: number; max?: number } = {}): number {
		let result = value;
		if (!(value >= min))
			result = Number.isFinite(min) ? min : 0;
		else if (value > max)
			result = max;
		else
			return value;

		$.Warning(`Invalid "${field}" value set in campaign script! Defined: "${value}" Allowed: [${min}, ${max}] Defaulting to "${result}"...`);
		return result;
	}

	private static dumpDebugInfo() {
		$.Msg('------------------');
		$.Msg(`Campaign Base Path: ${this.campaignPair ? getCampaignAssetPath(this.campaignPair) : '(none)'}`);
		$.Msg(`emptySlotAvatarSrc: ${this.emptySlotAvatarSrc}`);
		$.Msg('Lobby Settings:');
		for (const [key, value] of Object.entries(this.lobbyInfo.lobbySettings)) {
			$.Msg(`  ${key}: ${value}`);
		}
		for (const team of [LobbyTeam.SPECTATOR, LobbyTeam.RED, LobbyTeam.BLUE]) {
			$.Msg(`Team ${team}: ${JSON.stringify(this.teamAssets[team])}`);
		}
		$.Msg('------------------');
	}

	//#endregion

	//#region LobbyMenu Load/Unload

	static onLoad() {
		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuSwitchReverse', false);
		$.DispatchEvent('MainMenuHideBackgroundImage', true);
		$.DispatchEvent('MainMenuHideBackgroundMovie');
		$.DispatchEvent('ChangeVersionInfoPosition', 2);

		$.RegisterForUnhandledEvent('MapUnloaded', this.onUnload.bind(this));
		$.RegisterForUnhandledEvent('MainMenuModeRequestCleanup', this.onUnload.bind(this));
		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_LobbyStateChanged', this.onLobbyStateChanged.bind(this));
		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerStateChanged', this.onPlayerStateChanged.bind(this));
		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerJoined', this.playerJoin.bind(this));
		$.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerLeft', this.playerLeft.bind(this));

		this.initLobbyInfo();

		const pair = CampaignAPI.FindCampaign(P2CELobbyAPI.GetCampaignID());
		if (pair)
			this.applyCampaign(pair);
		else
			$.Warning(`No valid campaign pair could be retrieved with campaign ID "${P2CELobbyAPI.GetCampaignID()}"!`);

		this.clientInviteButton.visible = P2CELobbyAPI.IsLobbyOwner() || this.lobbyInfo.lobbySettings.allowClientInvites;

		this.updateLobbySlots();
		const localLP = this.getLocalLobbyPlayer();
		if (localLP)
			this.loadCampaignMenuAssets(localLP.team);
		LobbySubmenuManager.onLoad();
	}

	static onUnload() {
		this.clearLobbyInfo();
		LobbySubmenuManager.unloadCurSubMenu();
		this.stopMusic();
		$.DispatchEvent('ChangeVersionInfoPosition', 0);
	}

	//#endregion

	//#region Lobby State Handling

	// Clear LobbyInfo contents and from the global object.
	private static clearLobbyInfo() {
		const globalObj = UiToolkitAPI.GetGlobalObject();
		const lobbyInfo = globalObj[GlobalUiObjects.UI_LOBBYINFO] as LobbyInfo | undefined;

		if (lobbyInfo) {
			lobbyInfo.lobbySlots.forEach(slot => slot.destructor());
			lobbyInfo.lobbySlots.clear();
		}

		globalObj[GlobalUiObjects.UI_LOBBYINFO] = undefined;
	}

	// Clear and initialize LobbyInfo with default values.
	private static initLobbyInfo() {
		this.clearLobbyInfo();

		this.lobbyInfo = {
			lobbySlots: new Map(),
			// Lobby settings defaults. Matches Portal 2 Coop KV3 settings.
			// TODO: Consider pulling some of these settings from a cache or from the ConVars they associate with (ex. sv_tags)
			lobbySettings: {
				hostName: FriendsAPI.GetLocalPlayerName(),
				tags: '',
				password: '',
				lan: false,
				cheats: false,

				allowClientInvites: false,
				visibility: LobbyVisibility.FRIENDS_ONLY,

				maxPlayers: 2,
				requiredPlayers: 2,
				allowSplitscreen: false,
				waitForPlayers: true,
				maxNumTeams: 2,
				defaultTeam: LobbyTeam.BLUE,
				requiredNumTeamPlayers: 1,
				canSwitchTeams: false,
				allowSpectators: false,
			},
			lobbyData: {
				state: LobbyState.INVALID,
				campaign: '',
				chapter: '',
				map: 0
			},
		};

		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_LOBBYINFO] = this.lobbyInfo;
	}

	private static onLobbyStateChanged(lobbyData: LobbyData) {
		const prevCampaign = this.lobbyInfo.lobbyData.campaign;
		this.lobbyInfo.lobbyData = lobbyData;

		if (GameInterfaceAPI.GetSettingBool('developer')) {
			$.Msg('New Lobby State:');
			$.Msg(`Previous Campaign: ${prevCampaign}`);
			$.Msg('New Campaign:');
			$.Msg(`Campaign ID: ${this.lobbyInfo.lobbyData.campaign}`);
			$.Msg(`Chapter Name: ${this.lobbyInfo.lobbyData.chapter}`);
			$.Msg(`Map Index: ${this.lobbyInfo.lobbyData.map}`);
			$.Msg(`Lobby State: ${this.lobbyInfo.lobbyData.state}`);
		}

		// If loading into level, just use the loading indicator for addon download.
		if (lobbyData.state === LobbyState.LOADING) {
			this.lobbyInfo.lobbySlots.forEach(slot => {
				slot.setStatusIndicator(LobbyMemberReadyState.DOWNLOADING_ADDONS);
			});
		}

		if (lobbyData.campaign !== prevCampaign) {
			const pair = CampaignAPI.FindCampaign(lobbyData.campaign);
			if (pair)
				this.onCampaignChanged(pair);
			else
				$.Warning(`Unknown campaign "${lobbyData.campaign}"`);
		}
	}

	// TODO: Instead of destructing all slots, remove the players who left and condense or find a available slot if joining instead of remaking the list.
	static updateLobbySlots() {
		this.lobbyInfo.lobbySlots.forEach(slot => slot.destructor());
		this.lobbyInfo.lobbySlots.clear();

		let index = 0;
		for (const player of P2CELobbyAPI.GetPlayerList()) {
			if (!player)
				continue;
			this.lobbyInfo.lobbySlots.set(player.id, new PlayerEntry(player, index++));
		}
		for (; index < this.lobbyInfo.lobbySettings.maxPlayers; index++) {
			this.lobbyInfo.lobbySlots.set(index, new PlayerEntry(null, index));
		}
	}

	//#endregion

	//#region Campaign Handling

	static loadCampaignMenuAssets(team: LobbyTeam) {
		this.stopMusic();
		const pair = this.campaignPair;
		if (!pair)
			return;

		this.gameLogo.SetImage(readCampaignMeta(pair, CampaignMeta.FULL_LOGO, true) ?? getRandomFallbackImage());

		// Spectator specifically needs to inherit Red teams assets.
		const teamAsset = this.teamAssets[team === LobbyTeam.SPECTATOR ? LobbyTeam.RED : team];
		const pick = (teamVal: string, key: CampaignMeta, prefixBase: boolean) => (teamVal || readCampaignMeta(pair, key, prefixBase) || '');

		const bg = {
			music: pick(teamAsset.bgMusic, CampaignMeta.BG_MUSIC, false),
			movie: pick(teamAsset.bgMovie, CampaignMeta.BG_MOVIE, true),
			image: pick(teamAsset.bgImage, CampaignMeta.BG_IMG, true),
		};
		if (GameInterfaceAPI.GetSettingBool('developer'))
			$.Msg(`Background: music = "${bg.music}" movie = "${bg.movie}" image = "${bg.image}"`);

		$.DispatchEvent('MainMenuSwitchReverse', false);
		$.DispatchEvent('MainMenuHideBackgroundImage', true);
		$.DispatchEvent('MainMenuHideBackgroundMovie');

		if (bg.movie) {
			$.DispatchEvent('MainMenuShowBackgroundMovie', bg.movie);
		} else if (bg.image) {
			$.DispatchEvent('MainMenuShowBackgroundImage', bg.image, true);
		} else {
			$.Warning(`CAMPAIGN MENU: No background has been specified! Fix this now!!!\nFields:\n${JSON.stringify(bg)}`);
			$.DispatchEvent('MainMenuShowBackgroundImage', getRandomFallbackImage(), true);
		}

		if (bg.music)
			this.bgMusicID = $.PlaySoundEvent(bg.music);
	}

	private static applyMultiplayerOptions(pair: CampaignPair) {
		const settings = this.lobbyInfo.lobbySettings;
		const opts = pair.campaign.multiplayer_options;

		settings.allowSpectators = (readCampaignMeta(pair, CampaignMeta.ALLOW_SPECATORS, false) ?? 'false').toLowerCase() === 'true';

		const baseMaxPlayers = this.clampOption(opts.max_players, 'max_players', { min: 2, max: 33 });
		const baseMaxNumTeams = this.clampOption(opts.max_num_teams, 'max_num_teams', { min: 2 });

		// Engine's absolute max is 33 players, so don't let the spectator slot push past it.
		settings.maxPlayers = Math.min(baseMaxPlayers + (settings.allowSpectators ? 1 : 0), 33);
		// Spectators don't count towards the number of players required to start.
		settings.requiredPlayers = this.clampOption(opts.required_players, 'required_players', { min: 2, max: baseMaxPlayers });
		settings.requiredNumTeamPlayers = this.clampOption(opts.required_num_team_players, 'required_num_team_players', { min: 1 });
		settings.canSwitchTeams = opts.can_switch_teams;
		settings.maxNumTeams = baseMaxNumTeams + (settings.allowSpectators ? 1 : 0);
	}

	private static applyCampaign(pair: CampaignPair) {
		this.campaignPair = pair;
		this.teamAssets = resolveTeamAssets(pair);
		this.emptySlotAvatarSrc = readCampaignMeta(pair, CampaignMeta.EMPTY_SLOT_AVATAR_IMG, true) ?? DEFAULT_ICON;
		this.applyMultiplayerOptions(pair);
		if (GameInterfaceAPI.GetSettingBool('developer'))
			this.dumpDebugInfo();
	}

	// Called whenever the current campaign has been changed.
	private static onCampaignChanged(pair: CampaignPair) {
		this.applyCampaign(pair);
		this.updateLobbySlots();

		const localLP = this.getLocalLobbyPlayer();
		if (localLP)
			this.loadCampaignMenuAssets(localLP.team);
	}

	//#endregion

	//#region Player Handling

	static onPlayerStateChanged(steamID: steamID, lobbyPlayer: LobbyPlayer) {
		if (!lobbyPlayer || steamID.length === 0) {
			//! This indicates a issue with the Panorama event from the engine!
			throw new Error('No valid LobbyPlayer or SteamID was given for PlayerStateChanged!');
		}

		const playerEntry = this.lobbyInfo.lobbySlots.get(steamID);
		if (!playerEntry?.lobbyPlayer) {
			//! This indicates a issue with the Panorama event from the engine!
			throw new Error('No PlayerEntry/LobbyPlayer for PlayerStateChanged event!');
		}

		const prevTeam = playerEntry.lobbyPlayer.team;
		playerEntry.lobbyPlayer = lobbyPlayer;
		playerEntry.setStatusIndicator(lobbyPlayer.state);

		const isLocal = lobbyPlayer.id === UserAPI.GetXUID();
		const ui = READY_STATE_UI[lobbyPlayer.state];
		if (isLocal && ui) {
			for (const btnClass of READY_BTN_CLASSES) {
				this.clientReadyButton.SetHasClass(btnClass, btnClass === ui.btnClass);
			}
			this.clientReadyButtonText.text = ui.text;
		}

		// Set new campaign assets for the team when a switch occurs.
		if (lobbyPlayer.team !== prevTeam) {
			playerEntry.updateTeamMeta();
			if (isLocal)
				this.loadCampaignMenuAssets(lobbyPlayer.team);
		}
	}

	static playerJoin(lobbyPlayer: LobbyPlayer) {
		$.Msg('Player joined!');
		$.Msg(`Player Name: ${lobbyPlayer.name}`);
		$.Msg(`Player SteamID: ${lobbyPlayer.id}`);

		this.updateLobbySlots();

		// The local player may not have been in the player list when the menu loaded, so make sure the background is set up once they are.
		if (lobbyPlayer.id === UserAPI.GetXUID())
			this.loadCampaignMenuAssets(lobbyPlayer.team);
	}

	static playerLeft(player: steamID) {
		$.Msg('Player left!');
		$.Msg(`Player SteamID: ${player}`);

		this.updateLobbySlots();
	}

	static toggleReadyState() {

		const localLP = this.getLocalLobbyPlayer();
		if (!localLP)
			return;

		const playerState = localLP.state;

		if (playerState === LobbyMemberReadyState.NOT_READY)
			P2CELobbyAPI.SetReadyStatus(true);
		else if (playerState === LobbyMemberReadyState.READY)
			P2CELobbyAPI.SetReadyStatus(false);
		else if (playerState === LobbyMemberReadyState.DOWNLOADING_ADDONS)
			return; // Don't do anything if player is currently downloading addons.
	}

	//#endregion

	static requestExit() {
		$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
		UiToolkitAPI.ShowGenericPopupYesNo(
			$.Localize('#Action_Quit_Lobby'),
			$.Localize('#Action_Quit_InGame_Message_Multi'),
			'warning-popup',
			() => {
				this.stopMusic();
				P2CELobbyAPI.ExitLobby();
			},
			() => {}
		);
	}


}

type LobbyManSubMenus = 'lobby-info' | 'lobby-settings' | 'lobby-bans' | 'lobby-chat' | 'lobby-dev';

class LobbySubmenuManager {

	static lobbyManPanelInsert: Panel = $('#LobbyManSubMenuInsert')!;
	static subMenuPanel: Panel | undefined;

	static infoTabButton: RadioButton = $<RadioButton>('#LobbyInfoMenuButton')!;
	static settingsTabButton: RadioButton = $<RadioButton>('#LobbySettingsMenuButton')!;
	static banTabButton: RadioButton = $<RadioButton>('#LobbyBanListMenuButton')!;
	static chatTabButton: RadioButton = $<RadioButton>('#LobbyChatMenuButton')!;
	static devTabButton: RadioButton = $<RadioButton>('#LobbyDevMenuButton')!;

	static onLoad() {
		if (GameInterfaceAPI.GetSettingBool('developer'))
			this.devTabButton.visible = true;

		if (P2CELobbyAPI.IsLobbyOwner()) {
			this.infoTabButton.visible = true;
			this.infoTabButton.SetSelected(true);
			this.loadSubMenu('lobby-info');
			this.settingsTabButton.visible = true;
			this.banTabButton.visible = true;
		} else {
			this.chatTabButton.SetSelected(true);
			this.loadSubMenu('lobby-chat');
		}

		this.infoTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu('lobby-info') });
		this.settingsTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu('lobby-settings') });
		this.banTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu('lobby-bans') });
		this.chatTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu('lobby-chat') });
		this.devTabButton.SetPanelEvent('onactivate', () => { this.loadSubMenu('lobby-dev') });

		//! These are disabled for now as they aren't fully implemented.
		this.settingsTabButton.visible = false;
		this.chatTabButton.visible = false;
	}

	static loadSubMenu(submenuXML: LobbyManSubMenus) {
		if (this.subMenuPanel)
			this.unloadCurSubMenu();

		this.subMenuPanel = $.CreatePanel('Panel', this.lobbyManPanelInsert, `LobbyManSubMenu_${submenuXML}`);
		this.subMenuPanel.LoadLayout(`file://{resources}/layout/pages/main-menu/lobby-menu-submenus/${submenuXML}.xml`, false, false);
	}

	static unloadCurSubMenu() {
		if (!this.subMenuPanel)
			return;

		this.subMenuPanel.RemoveAndDeleteChildren();
		this.subMenuPanel.DeleteAsync(0);
		this.subMenuPanel = undefined;
	}
}
