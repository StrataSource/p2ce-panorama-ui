'use strict';

class CampaignMenu {
	static buttons: MenuButton[] = [
		{
			id: 'NewGameBtn',
			headline: '#MainMenu_Campaigns_MM_NewGame',
			tagline: '#MainMenu_Campaigns_MM_NewGame_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'NewGame', 'campaigns/new-game', undefined);
			},
			focused: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			}
		},
		{
			id: 'CampaignContinueBtn',
			headline: '#MainMenu_Campaigns_MM_LoadAuto',
			tagline: '[PH] ????',
			activated: () => {
				$.DispatchEvent('LoadingScreenClearLastMap');
				GameInterfaceAPI.ConsoleCommand('disconnect');
				CampaignAPI.ContinueCampaign(this.latestSave.mapGroup);
			},
			hovered: () => {
				if (this.continueBtnEnabled && this.continueBox.IsValid()) this.continueBox.visible = true;
			},
			unhovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
			additionalClasses: 'mainmenu__nav__btn__no-gradient',
			focusIsHover: true
		},
		{
			id: 'LoadGameBtn',
			headline: '#MainMenu_SaveRestore_Load',
			tagline: '#MainMenu_SaveRestore_Main_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'GameSaves', 'campaigns/saves-list', undefined);
			},
			focused: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			}
		},
		{
			id: 'SettingsKeyboardBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '#MainMenu_Navigation_Options_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Settings', 'settings/settings', undefined);
			},
			focused: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			}
		},
		{
			id: 'ExitCampaignBtn',
			headline: '#MainMenu_Navigation_Disconnect',
			tagline: '#MainMenu_Navigation_Disconnect_CM_Tagline',
			activated: () => {
				GameInterfaceAPI.ConsoleCommand('disconnect');
				$.Schedule(0.1, () => {
					$.Msg('CAMPAIGN MENU: Clearing active campaign');
					CampaignAPI.SetActiveCampaign(null);
				});
			},
			focused: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			}
		},
		{
			id: 'QuitBtn',
			headline: '#MainMenu_Navigation_QuitGame',
			tagline: '#MainMenu_Navigation_QuitGame_Tagline',
			activated: () => {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_Quit'),
					$.Localize('#Action_Quit_Message'),
					'warning-popup',
					$.Localize('#Action_Quit'),
					() => {
						GameInterfaceAPI.ConsoleCommand('quit');
					},
					$.Localize('#Action_Return'),
					() => {},
					'blur'
				);
			},
			focused: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			}
		}
	];

	static continueBox = $<Panel>('#ContinueBox')!;
	static continueBoxText = $<Label>('#ContinueSaveTagline')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueBtnEnabled: boolean = false;
	static continueBtn: string = 'CampaignContinueBtn';
	static loadGameBtnEnabled: boolean = false;
	static loadGameBtn: string = 'LoadGameBtn';
	static latestSave: GameSave;

	static bgMapLoad: uuid | undefined = undefined;
	static music: uuid | undefined = undefined;
	static mapLoadEvent: uuid | undefined = undefined;

	static onLoad() {
		// check to see if we specified default campaign AND
		// this is the first campaign we've booted up (this signifies
		// that the game has taken care of the background map for us
		// and we should do [almost] nothing)
		const skipBgMapLoad =
			GameInterfaceAPI.GetSettingString('campaign_default').length > 0 &&
			!UiToolkitAPI.GetGlobalObject()['FirstCampaignLoaded'];

		if (skipBgMapLoad) {
			UiToolkitAPI.GetGlobalObject()['FirstCampaignLoaded'] = true;
		}

		if (isSingleWsCampaign(CampaignAPI.GetActiveCampaign()!)) {
			$.Msg('Auto generated campaign detected! Redirecting to special...');
			$.Schedule(0.01, () => {
				CampaignAPI.SetActiveCampaign(SpecialString.P2CE_SP_WS_CAMPAIGN);
			});
			return;
		}

		for (const btn of this.buttons) {
			if (skipBgMapLoad) {
				// do NOT construct exit campaign button if default is provided
				// this is for sourcemods / standalone mods that use p2ce as a base
				if (btn.id === 'ExitCampaignBtn') {
					continue;
				}
			} else {
				// do NOT construct exit game button if default is NOT provided
				// this is for standard gameplay
				if (btn.id === 'QuitBtn') {
					continue;
				}
			}

			$.DispatchEvent('MainMenuAddButton', btn);
		}

		$.RegisterForUnhandledEvent('MapUnloaded', () => {
			this.stopMusic();
		});

		$.RegisterForUnhandledEvent('MainMenuModeRequestCleanup', () => {
			this.stopMusic();
		});

		$.RegisterForUnhandledEvent('UnloadLoadingScreenAndReinit', () => {
			$.DispatchEvent('MainMenuSwitchFade', true, true);
			$.DispatchEvent('MainMenuSetLoadingIndicatorVisibility', true);
		});

		$.RegisterForUnhandledEvent('MapLoaded', (map: string, bg: boolean) => {
			const ch = CampaignAPI.GetCampaignMeta(null);
			const bgMusic = (ch['background_music'] as string) ?? '';
			$.DispatchEvent('MainMenuHideBackgroundImage', false);
			$.DispatchEvent('MainMenuSwitchReverse', false);
			$.DispatchEvent('MainMenuHideBackgroundMovie');
			if (bgMusic.length > 0) {
				this.music = $.PlaySoundEvent(bgMusic);
			}
		});

		this.setContinueDetails();
		this.setCampaignBackground(skipBgMapLoad, false);
	}

	static setContinueDetails() {
		let c = CampaignAPI.GetActiveCampaign()!;

		const meta = CampaignAPI.GetCampaignMeta(`${c.bucket.id}/${c.campaign.id}`);
		const logo = meta.get(CampaignMeta.FULL_LOGO);
		if (logo) {
			$.DispatchEvent('MainMenuSetLogo', `${getCampaignAssetPath(c)}${logo}`);

			const s = meta.get(CampaignMeta.LOGO_HEIGHT) ?? CampaignLogoSizePreset.STANDARD;
			$.DispatchEvent('MainMenuSetLogoSize', s);
		} else {
			$.DispatchEvent('MainMenuSetLogo', '');
			$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
		}

		const isWsSingle = isSpecialSingleWsCampaign(c);

		this.continueBox.visible = false;

		const saves = GameSavesAPI.GetGameSaves()
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime))
			.filter((a) => {
				return isWsSingle
					? a.mapGroup.startsWith(SpecialString.AUTO_WS)
					: a.mapGroup === `${c.bucket.id}/${c.campaign.id}`;
			});

		this.continueBtnEnabled = false;
		let continueBtnText = $.Localize('#MainMenu_SaveRestore_NoSaves');

		$.DispatchEvent('MainMenuSetButtonProps', this.continueBtn, {
			taglineText: continueBtnText,
			enabled: this.continueBtnEnabled
		});

		if (saves.length === 0) {
			$.Warning('CAMPAIGN MENU: No saves');
			this.loadGameBtnEnabled = false;
			return;
		}

		// set the continue button states

		this.latestSave = saves[0];

		if (isWsSingle) {
			const realCampaign = CampaignAPI.FindCampaign(this.latestSave.mapGroup);
			if (realCampaign) {
				c = realCampaign;
			} else {
				$.Warning(`Associated campaign ID ${this.latestSave.mapGroup} could not be found`);
			}
		}

		const savChapter: ChapterInfo | undefined =
			this.latestSave.chapter < c.campaign.chapters.length
				? c.campaign.chapters[this.latestSave.chapter]
				: undefined;

		if (!savChapter) {
			$.Warning('CAMPAIGN MENU: Map could not be found for Campaign');
			return;
		}

		//const chapterString = `[${c.chapters.indexOf(savChapter!) + 1} / ${c.chapters.length}]`;

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		const date = new Date(Number(this.latestSave.fileTime));
		this.continueBoxText.text = convertTime(date);
		const chapterName = isWsSingle ? c.campaign.title : $.Localize(savChapter.title);
		continueBtnText = chapterName.replace('\n', ': ');

		this.continueBtnEnabled = true;

		$.DispatchEvent('MainMenuSetButtonProps', this.continueBtn, {
			taglineText: continueBtnText,
			enabled: this.continueBtnEnabled
		});
	}

	static setCampaignBackground(skipBgMapLoad: boolean, doFallbackImage: boolean) {
		// TODO: obey background map setting
		if (this.bgMapLoad === undefined) {
			this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
				'map_load_failed',
				(mapName: string, isBackgroundMap: boolean) => {
					if (!isBackgroundMap) return;
					$.Warning('!!!!! Could not load Campaign background map !!!!!');
					$.Schedule(0.001, () => {
						this.setCampaignBackground(false, true);
					});
				}
			);
		}

		const ch = CampaignAPI.GetCampaignMeta(null);
		const bgLevel = (ch.get(CampaignMeta.BG_MAP) as string) ?? '';
		const bgMusic = (ch.get(CampaignMeta.BG_MUSIC) as string) ?? '';
		const bgMovie = (ch.get(CampaignMeta.BG_MOVIE) as string) ?? '';
		const bgImage = (ch.get(CampaignMeta.BG_IMG) as string) ?? '';
		const basePath = getCampaignAssetPath(CampaignAPI.GetActiveCampaign()!);
		const playMusic = () => {
			if (bgMusic.length > 0) {
				this.music = $.PlaySoundEvent(bgMusic);
			}
		};
		if (!doFallbackImage && bgLevel.length > 0) {
			if (GameInterfaceAPI.GetCurrentMap() === bgLevel) {
				$.Warning('Background map already active. Do nothing.');
				$.DispatchEvent('MapLoaded', bgLevel, true);
				return;
			}
			$.DispatchEvent('MainMenuSetLoadingIndicatorVisibility', true);
			$.DispatchEvent('MainMenuShowBackgroundImage', `${basePath}${bgImage}`, false);
			if (!skipBgMapLoad) {
				$.Msg(`CAMPAIGN MENU: Attempting to load background map ${bgLevel}`);
				GameInterfaceAPI.ConsoleCommand('startupmenu');
			} else {
				$.Msg(
					'CAMPAIGN MENU: Background map specified and default campaign specified, we will be doing nothing.'
				);
			}
			if (!this.mapLoadEvent) {
				this.mapLoadEvent = $.RegisterForUnhandledEvent('MapLoaded', (map: string) => {
					playMusic();
				});
			}
		} else if (!doFallbackImage && bgMovie.length > 0) {
			$.DispatchEvent('MainMenuSwitchReverse', false);
			$.DispatchEvent('MainMenuHideBackgroundImage', true);
			$.DispatchEvent('MainMenuShowBackgroundMovie', `${basePath}${bgMovie}`);
			playMusic();
		} else if (bgImage.length > 0) {
			$.DispatchEvent('MainMenuSwitchReverse', false);
			$.DispatchEvent('MainMenuShowBackgroundImage', `${basePath}${bgImage}`, true);
			playMusic();
		} else if (doFallbackImage) {
			$.Warning('CAMPAIGN MENU: No background was specified, and fallback was requested!');
			$.DispatchEvent('MainMenuSwitchReverse', false);
			$.DispatchEvent('MainMenuShowBackgroundImage', getRandomFallbackImage(), true);
			playMusic();
		} else {
			$.Warning('CAMPAIGN MENU: No background has been specified! Fix this now!!!');
			$.Warning(
				`Fields:\nbgLevel = ${bgLevel}\nbgMusic = ${bgMusic}\nbgMovie = ${bgMovie}\nbgImage = ${bgImage}\nbasePath = ${basePath}`
			);
			$.DispatchEvent('MainMenuSwitchReverse', false);
			$.DispatchEvent('MainMenuShowBackgroundImage', getRandomFallbackImage(), true);
			playMusic();
		}
	}

	static stopMusic() {
		if (this.music) $.StopSoundEvent(this.music);
		this.music = undefined;
	}

	static onMapUnloaded() {
		this.stopMusic();
	}
}
