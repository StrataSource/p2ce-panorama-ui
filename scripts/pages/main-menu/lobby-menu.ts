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
	maxTeams: number;
}

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

	hostIcon: Image;
	steamFriendIcon: Image;
	addonMissingNotice: Panel;
	teamIcon: Image;

	constructor (lobbyPlayer: LobbyPlayer) {
		this.playerEntryPanel = $.CreatePanel('Panel', LobbyMenu.playerListPanel, `playerslot_${lobbyPlayer.id}`);
		this.playerEntryPanel.LoadLayoutSnippet('PlayerEntry');

		this.playerInfo = {
			lobbyInfo: lobbyPlayer,
			hasAllAddons: true, // TODO: Replace with a API function that checks if the user does in fact have needed addons/custom content.
			team: (LobbyMenu.lobbySlots.size % 2 === 0) ? Team.TEAM_BLUE : Team.TEAM_RED
		};

		this.playerAvatar = this.playerEntryPanel.FindChildTraverse('PlayerAvatar')!;
		this.playerAvatar.steamid = lobbyPlayer.id;
		this.playerEntryPanel.SetDialogVariable('name', lobbyPlayer.name);
		this.playerEntryPanel.SetDialogVariable('teamName', LobbyMenu.teamName[this.playerInfo.team]); // TODO: Change to team name than team index.

		this.kickBtn = this.playerEntryPanel.FindChildTraverse('KickBtn')!;
		this.kickBtn.SetPanelEvent('onactivate', this.kickPlayer.bind(this));

		this.banBtn = this.playerEntryPanel.FindChildTraverse('BanBtn')!;
		this.banBtn.SetPanelEvent('onactivate', this.banPlayer.bind(this));

		this.steamProfileBtn = this.playerEntryPanel.FindChildTraverse('SteamProfileBtn')!;
		this.steamProfileBtn.SetPanelEvent('onactivate', this.openSteamProfile.bind(this));

		// TODO: Remove when the team icon placement is not influenced by the visibility of the ban and kick buttons on the host.
		if (P2CELobbyAPI.IsLobbyOwner() && !lobbyPlayer.owner) {
			this.kickBtn.visible = true;
			this.banBtn.visible = true;
		}
		// TODO: Temporary disabled until the team icon placement is done better.
		// this.playerEntryPanel.SetPanelEvent('onmouseover', () => {
		// 	if (!P2CELobbyAPI.IsLobbyOwner || lobbyPlayer.id === UserAPI.GetXUID()) return;

		// 	this.kickBtn.visible = true;
		// 	this.banBtn.visible = true;
		// });
		// this.playerEntryPanel.SetPanelEvent('onmouseout', () => {
		// 	this.kickBtn.visible = false;
		// 	this.banBtn.visible = false;
		// });

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

		this.teamIcon.SetImage(LobbyMenu.teamIconSrc[this.playerInfo.team]);
	}

	destruct() {
		this.playerEntryPanel.RemoveAndDeleteChildren();
		this.playerEntryPanel.DeleteAsync(0);
	}

	kickPlayer() {
		$.Msg(`Kicked player: ${this.playerInfo.lobbyInfo.name} (${this.playerInfo.lobbyInfo.id})`);
		P2CELobbyAPI.KickPlayer(this.playerInfo.lobbyInfo.id);
	}

	// Currently only "bans" player during the Panels lifetime.
	banPlayer() {
		$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
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
	static campaignID: string;

	// Names for each team.
	static teamName = {
		[Team.TEAM_ANY]: 		'[HC] Any',
		[Team.TEAM_INVALID]: 	'[HC] INVALID TEAM', // This technically doesn't need to be here, but just in case UI wise.
		[Team.TEAM_UNASSIGNED]: '[HC] Unassigned',
		[Team.TEAM_SPECTATOR]: 	'[HC] Spectator',   // Can be changed by campaign script.
		[Team.TEAM_RED]: 		'[HC] Team Red', 	// Can be changed by campaign script.
		[Team.TEAM_BLUE]: 		'[HC] Team Blue', 	// Can be changed by campaign script.
		//[Team.TEAM_GREEN]: 	'[HC] Team Green', 	// Can be changed by campaign script.
		//[Team.TEAM_YELLOW]: 	'[HC] Team Yellow', // Can be changed by campaign script.
	};

	static teamNameMeta = {
		[Team.TEAM_SPECTATOR]: CampaignMeta.TEAM_SPECTATOR_NAME,
		[Team.TEAM_RED]: CampaignMeta.TEAM_RED_NAME,
		[Team.TEAM_BLUE]: CampaignMeta.TEAM_BLUE_NAME,
		//[Team.TEAM_GREEN]: CampaignMeta.TEAM_GREEN_NAME,
		//[Team.TEAM_YELLOW]: CampaignMeta.TEAM_YELLOW_NAME,
	};

	// Cache icon paths so they don't need to be looked up every time someone joins.
	// These can be changed by the campaign script.
	static teamIconSrc = {
		[Team.TEAM_SPECTATOR]: 'file://{images}/menu/missing-cover.png',
		[Team.TEAM_RED]: 'file://{images}/menu/missing-cover.png',
		[Team.TEAM_BLUE]: 'file://{images}/menu/missing-cover.png',
		//[Team.TEAM_GREEN]: 'file://{images}/menu/missing-cover.png',
		//[Team.TEAM_YELLOW]: 'file://{images}/menu/missing-cover.png',
	};

	static teamIconMeta = {
		[Team.TEAM_SPECTATOR]: CampaignMeta.TEAM_SPECTATOR_IMG,
		[Team.TEAM_RED]: CampaignMeta.TEAM_RED_IMG,
		[Team.TEAM_BLUE]: CampaignMeta.TEAM_BLUE_IMG,
		//[Team.TEAM_GREEN]: CampaignMeta.TEAM_GREEN_IMG,
		//[Team.TEAM_YELLOW]: CampaignMeta.TEAM_YELLOW_IMG,
	};

	static emptySlotAvatarSrc: string = 'file://{images}/menu/missing-cover.png';


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

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_PlayerStateChanged',
			() => {
				this.updateUIState(); // TODO: This might change or be removed later since enter and left events will later work.
			}
		);

		$.RegisterForUnhandledEvent(
			'PanoramaComponent_P2CELobby_OnStartWithAddonsMissing',
			() => {
				$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
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
			visibility: LobbyVisibility.FRIENDS_ONLY,
			maxTeams: 2
		}

		this.campaignID = P2CELobbyAPI.GetCampaignID();
		const c = CampaignAPI.FindCampaign(this.campaignID);
		if (c) {
			const basePath = getCampaignAssetPath(c);
			const getMetaSrc = (metaKey: CampaignMeta, addBasePath: boolean = true) => {
				const src = c.campaign.meta.get(metaKey);
				return src ? `${addBasePath ? basePath : ''}${src}` : undefined; // Don't want to override the value with a blank string, instead default to the localization.
			};

			const bgMusic = getMetaSrc(CampaignMeta.BG_MUSIC, false);
			const bgMovie = getMetaSrc(CampaignMeta.BG_MOVIE);
			const bgImage = getMetaSrc(CampaignMeta.BG_IMG);

			for (let team = Team.TEAM_SPECTATOR; team < Team.TEAM_MAX; team++) {
				this.teamName[team] = getMetaSrc(this.teamNameMeta[team], false) ?? this.teamName[team];
				this.teamIconSrc[team] = getMetaSrc(this.teamIconMeta[team]) ?? this.teamIconSrc[team];
			};

			this.emptySlotAvatarSrc = getMetaSrc(CampaignMeta.EMPTY_SLOT_AVATAR_IMG) ?? '';

			// $.Msg('------------------');
			// $.Msg(this.teamName[Team.TEAM_SPECTATOR]);
			// $.Msg(this.teamName[Team.TEAM_BLUE]);
			// $.Msg(this.teamName[Team.TEAM_RED]);
			// $.Msg(this.teamIconSrc[Team.TEAM_SPECTATOR]);
			// $.Msg(this.teamIconSrc[Team.TEAM_BLUE]);
			// $.Msg(this.teamIconSrc[Team.TEAM_RED]);
			// $.Msg('------------------');

			const playMusic = () => {
				if (bgMusic) {
					this.bgMusicID = $.PlaySoundEvent(bgMusic);
				}
			};
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
				playMusic();
			}

			this.lobbySettings.maxPlayers = c.campaign.multiplayer_options.required_players;
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

	static updateUIState() {
		for (const [id, player] of this.lobbySlots) {
			player.destruct();
		}
		this.lobbySlots.clear();
		this.numPlayers = 0;
		for (const player of P2CELobbyAPI.GetPlayerList()) {
			this.lobbySlots.set(player.id, new PlayerEntry(player));
		}
		this.numPlayers = this.lobbySlots.size;

		if (this.lobbySlots.size < this.lobbySettings.maxPlayers) {
			for (let slot = this.lobbySlots.size; slot < this.lobbySettings.maxPlayers; slot++) {
				this.lobbySlots.set(slot, new EmptyEntry(slot));
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
		this.lobbySlots.set(lobbyPlayer.id, new PlayerEntry(lobbyPlayer));

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

	static dumpSlotList() {
		let slot = 0;
		this.lobbySlots.forEach(playerEntry => {
			$.Msg(`Slot: ${slot}`);
			if (playerEntry instanceof PlayerEntry) {
				$.Msg(`Player Name: ${playerEntry.playerInfo.lobbyInfo.name}`);
				$.Msg(`Player SteamID: ${playerEntry.playerInfo.lobbyInfo.id}`);
				$.Msg(`Player Is Host?: ${playerEntry.playerInfo.lobbyInfo.owner}`);
				$.Msg(`Player Has All Required Addons?: ${playerEntry.playerInfo.hasAllAddons}`);
				$.Msg(`Player Team: ${playerEntry.playerInfo.team}`);
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

		P2CELobbyAPI.StartGameSession();
	}

	static stopMusic() {
		if (this.bgMusicID) $.StopSoundEvent(this.bgMusicID);
		this.bgMusicID = undefined;
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

	static onLoadInfoSubMenu() {
		this.subMenuPanel?.SetDialogVariableInt('curplayers', LobbyMenu.numPlayers);
		this.subMenuPanel?.SetDialogVariableInt('maxplayers', LobbyMenu.lobbySettings.maxPlayers);
		this.subMenuPanel?.SetDialogVariableInt('requiredplayers', LobbyMenu.lobbySettings.maxPlayers); // TODO: Fix me once required and max players are two separate things.
	}

	static retrieveBanList(): Array<steamID> {
		const banList = $.LoadKeyValues3File('cfg/lobbybans.kv3') as Record<string, Array<unknown>> as Record<string, Array<steamID>>;
		if (banList === undefined || banList.bans === undefined || !(banList.bans instanceof Array)) {
			return [];
		}

		return banList.bans;
	}
}
