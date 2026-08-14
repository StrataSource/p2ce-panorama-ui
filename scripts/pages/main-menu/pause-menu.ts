'use strict';

class PauseMenu {
	static buttons: MenuButton[] = [
		{
			id: 'ResumeBtn',
			headline: '#MainMenu_Home_Resume',
			tagline: '#MainMenu_Home_Resume_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuResumeGame');
			},
			hovered: () => {},
			unhovered: () => {},
			focusIsHover: true
		},
		{
			id: 'QueueBtn',
			headline: '#MainMenu_Campaigns_MM_ShowWSQueue',
			tagline: '#MainMenu_Campaigns_MM_ShowWSQueue_Tagline',
			activated: () => {
				const isCoop: boolean = false; // TODO: TEMPORARY! REPLACE WITH API FUNCTION WHICH GIVES IF IT'S MULTIPLAYER!
				if (!isCoop) {
					$.DispatchEvent(
						'MainMenuOpenNestedPage',
						'SinglePlayer',
						'main-menu/play/singleplayer/content-selector-sp',
						undefined
					);
					return;
				}

				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'MultiPlayer',
					'main-menu/play/multiplayer/content-selector-mp',
					undefined
				);
			},
			hovered: () => {},
			unhovered: () => {},
			focusIsHover: true
		},
		{
			id: 'LoadGameBtn',
			headline: '#MainMenu_SaveRestore_Main',
			tagline: '#MainMenu_SaveRestore_Main_Tagline',
			activated: () => {
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'GameSaves',
					'main-menu/play/singleplayer/saves-list',
					undefined
				);
			},
			hovered: () => {},
			focusIsHover: true
		},
		{
			id: 'AddonsBtn',
			headline: '#MainMenu_Navigation_Addons',
			tagline: '#MainMenu_Navigation_Addons_Tagline_IG',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Content', 'main-menu/addons', undefined);
			},
			hovered: () => {}
		},
		{
			id: 'SettingsKeyboardBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '#MainMenu_Navigation_Options_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Settings', 'main-menu/settings/settings', undefined);
			},
			hovered: () => {},
			focusIsHover: true
		},
		{
			id: 'QuitBtn',
			headline: '#MainMenu_Navigation_Disconnect',
			tagline: '#MainMenu_Navigation_Disconnect_Tagline',
			activated: () => {
				UiToolkitAPI.ShowGenericPopupThreeOptionsBgStyle(
					$.Localize('#Action_Quit'),
					$.Localize('#Action_Quit_InGame_Message'),
					'quit-popup',
					$.Localize('#Common_ReturnToMenu'),
					() => {
						const c = CampaignAPI.GetActiveCampaign();
						// No campaign? Not an auto campaign? Not an addon? Local addon? Has been rated?
						// SKIP AND LEAVE!
						if (!c ||
							!c.bucket.id.startsWith('auto_') ||
							c.bucket.addon_id === -1 ||
							WorkshopAPI.GetAddonMeta(c.bucket.addon_id).local ||
							WorkshopAPI.GetAddonUserRating(c.bucket.addon_id) !== 0
						) {
							GameInterfaceAPI.ConsoleCommand('disconnect');
							return;
						}
						CampaignAPI.OpenRatingMenu();
					},
					$.Localize('#Action_QuitToDesktop'),
					() => {
						GameInterfaceAPI.ConsoleCommand('quit');
					},
					$.Localize('#Common_Return'),
					() => {},
					'blur'
				);
			},
			hovered: () => {},
			focusIsHover: true
		}
	];

	// map panel
	static mapPane = $<Panel>('#MapPanel')!;
	static mapImage = $<Image>('#MapImage')!;
	static mapTitle = $<Label>('#MapTitle')!;
	static mapAuthor = $<Label>('#MapAuthor')!;
	static mapUpvote = $<Button>('#MapUpvote')!;
	static mapDownvote = $<Button>('#MapDownvote')!;
	static mapFavorite = $<Button>('#MapFavorite')!;
	static mapAvatar = $<AvatarImage>('#MapAvatar')!;
	static mapVoteBox = $<Panel>('#VoteBox')!;
	static mapWorkshopBtm = $<Panel>('#AddonBottom')!;
	static votePanels = [undefined, $<RadioButton>('#MapUpvote')!, $<RadioButton>('#MapDownvote')!];

	static workshopId: bigint;
	static addonId: number;

	static latestSave: GameSave;

	static onLoad() {
		const c = CampaignAPI.GetActiveCampaign();
		for (const btn of this.buttons) {
			if (btn.id === 'QueueBtn') {
				if (!c || !c.bucket.id.startsWith('auto_')) {
					continue;
				}
			}
			$.DispatchEvent('MainMenuAddButton', btn);
		}

		// style doesnt update when the focus is set from the above event
		// so adding another event to just do it again because THE GAME HATES ME!!!!!!!
		$.DispatchEvent('MainMenuFirstButtonFocus');

		$.DispatchEvent('MainMenuHideBackgroundMovie');
		$.DispatchEvent('MainMenuHideBackgroundImage', true);
		$.DispatchEvent('MainMenuSwitchReverse', true);

		const p = $.CreatePanel('Panel', $.GetContextPanel(), 'MenuBackgroundLayer');
		p.SetReadyForDisplay(false);
		p.LoadLayoutSnippet('MenuBackgroundLayer');
		$.DispatchEvent('MainMenuAddBgPanel', p);
		p.FindChildTraverse('PauseMenuMainMenuBlur')!.AddClass('mainmenu__pause-blur__anim');

		$.RegisterForUnhandledEvent('MainMenuSetPauseBlur', (doBlur: boolean) => {
			if (doBlur) {
				p.FindChildTraverse('PauseMenuMainMenuBlur')!.AddClass('mainmenu__pause-blur__anim');
			} else {
				p.FindChildTraverse('PauseMenuMainMenuBlur')!.RemoveClass('mainmenu__pause-blur__anim');
			}
		});

		this.setMapPanel();
		this.setLogo();
	}

	static setLogo() {
		const c = CampaignAPI.GetActiveCampaign();
		if (c) {
			const meta = CampaignAPI.GetCampaignMeta(null)!;
			const logo = meta.get(CampaignMeta.FULL_LOGO);
			if (logo) {
				$.DispatchEvent('MainMenuSetLogo', `${getCampaignAssetPath(c)}${logo}`);

				const s = meta.get(CampaignMeta.LOGO_HEIGHT) ?? CampaignLogoSizePreset.STANDARD;
				$.DispatchEvent('MainMenuSetLogoSize', s);
			} else if (isSingleWsCampaign(c)) {
				$.DispatchEvent('MainMenuSetLogo', 'file://{images}/logo.svg');
				$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
			}
		} else {
			$.DispatchEvent('MainMenuSetLogo', 'file://{images}/logo.svg');
			$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
		}
	}

	static setMapPanel() {
		const c = CampaignAPI.GetActiveCampaign();
		if (!c || !c.bucket.id.startsWith('auto_')) {
			this.mapPane.visible = false;
			return;
		}

		this.addonId = c.bucket.addon_id;
		const addon = WorkshopAPI.GetAddonMeta(this.addonId);

		this.mapTitle.text = addon.title;
		this.mapImage.SetImage(addon.thumb);
		let string = '';
		for (let i = 0; i < addon.authors.length; ++i)
			string += i === addon.authors.length - 1 ? addon.authors[i] : `${addon.authors[i]}, `;
		this.mapAuthor.text = string;

		if (addon.local) {
			this.mapVoteBox.visible = false;
			this.mapWorkshopBtm.visible = false;
		} else {
			WorkshopAPI.CreateQueryUGCDetailsRequest([addon.workshopid]).then((data: Array<SteamUGCDetails_t|null>) => {
				if (data.length === 0 || data[0] === null) return;
				this.mapAvatar.steamid = `${data[0].ulSteamIDOwner}`;
			});

			this.workshopId = addon.workshopid;
			const votePanel = this.votePanels[WorkshopAPI.GetAddonUserRating(this.addonId)];
			if (votePanel) votePanel.SetSelected(true);
		}
	}

	static setMapVote(vote: AddonRating) {
		WorkshopAPI.SetAddonUserRating(this.addonId, vote);
	}

	static toggleMapFavorite() {
		$.Warning('Not implemented!');
	}

	static openMapWorkshop() {
		OpenWorkshopPageFromID(this.workshopId);
	}

	static openSteamProfile() {
		SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/profiles/${this.mapAvatar.steamid}`);
	}
}
