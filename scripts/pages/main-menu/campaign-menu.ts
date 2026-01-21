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
				if (this.continueBox.IsValid())
					this.continueBox.visible = false;
			}
		},
		{
			id: 'CampaignContinueBtn',
			headline: '#MainMenu_Campaigns_MM_LoadAuto',
			tagline: '[PH] ????',
			activated: () => {
				$.DispatchEvent('LoadingScreenClearLastMap');
				CampaignAPI.ContinueCampaign(CampaignAPI.GetActiveCampaign()!.id);
			},
			hovered: () => {
				if (this.continueBtn.enabled) this.continueBox.visible = true;
			},
			unhovered: () => {
				if (this.continueBox.IsValid())
					this.continueBox.visible = false;
			},
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
				if (this.continueBox.IsValid())
					this.continueBox.visible = false;
			}
		},
		{
			id: 'SettingsBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '#MainMenu_Navigation_Options_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Settings', 'settings/settings', undefined);
			},
			focused: () => {
				if (this.continueBox.IsValid())
					this.continueBox.visible = false;
			}
		},
		{
			id: 'ExitCampaignBtn',
			headline: '#MainMenu_Navigation_Disconnect',
			tagline: '#MainMenu_Navigation_Disconnect_CM_Tagline',
			activated: () => {
				GameInterfaceAPI.ConsoleCommand('disconnect');
				$.Schedule(0.1, () => {
					CampaignAPI.SetActiveCampaign(null);
				});
			},
			focused: () => {
				if (this.continueBox.IsValid())
					this.continueBox.visible = false;
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
						this.reparent();
						$.Schedule(0.01, () => { GameInterfaceAPI.ConsoleCommand('quit'); });
					},
					$.Localize('#Action_Return'),
					() => {},
					'blur'
				);
			},
			focused: () => {
				if (this.continueBox.IsValid())
					this.continueBox.visible = false;
			}
		}
	];

	static continueBtnText = $<Label>('#ContinueSaveTagline')!;
	static continueBox = $<Panel>('#ContinueBox')!;
	static continueBoxText = $<Label>('#ContinueSaveTagline')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueBtn: Button;
	static loadGameBtn: Button;
	static latestSave: GameSave;

	static bgMapLoad: uuid | undefined = undefined;
	static music: uuid | undefined = undefined;

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

			if (btn.id === 'CampaignContinueBtn') {
				this.continueBtn = constructMenuButton(btn);
				this.continueBtn.AddClass('mainmenu__nav__btn__no-gradient');

				const t = this.continueBtn.FindChildTraverse('CampaignContinueBtn_Tagline');
				if (t) this.continueBtnText = t as Label;
				else throw new Error('Cannot find Continue Button tagline!');

				$.DispatchEvent('MainMenuAddPreConstructedButton', this.continueBtn);
				continue;
			} else if (btn.id === 'LoadGameBtn') {
				this.loadGameBtn = constructMenuButton(btn);
				$.DispatchEvent('MainMenuAddPreConstructedButton', this.loadGameBtn);
				continue;
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
		this.setCampaignBackground(skipBgMapLoad);
	}

	static setContinueDetails() {
		const c = CampaignAPI.GetActiveCampaign()!;

		$.DispatchEvent('MainMenuSetLogo', `${c.meta[CampaignMeta.FULL_LOGO]}`);

		this.continueBox.visible = false;

		const saves = GameSavesAPI.GetGameSaves()
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime))
			.filter((a) => {
				return a.mapGroup === c.id;
			});

		this.continueBtn.enabled = false;
		this.continueBtnText.text = $.Localize('#MainMenu_SaveRestore_NoSaves');

		if (saves.length === 0) {
			$.Warning('CAMPAIGN MENU: No saves');
			this.loadGameBtn.enabled = false;
			return;
		}

		// set the continue button states

		this.latestSave = saves[0];

		const savChapter = c.chapters.find((ch) => {
			return (
				ch.maps.find((map) => {
					return map.name === this.latestSave.mapName || map.name === `${this.latestSave.mapName}.bsp`;
				}) !== undefined
			);
		});

		if (!savChapter) {
			$.Warning('CAMPAIGN MENU: Map could not be found for Campaign');
			return;
		}

		//const chapterString = `[${c.chapters.indexOf(savChapter!) + 1} / ${c.chapters.length}]`;

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		const date = new Date(Number(this.latestSave.fileTime));
		this.continueBoxText.text = convertTime(date);
		this.continueBtnText.text = $.Localize(savChapter.title);

		this.continueBtn.enabled = true;
	}

	static setCampaignBackground(skipBgMapLoad: boolean) {
		// TODO: obey background map setting
		if (this.bgMapLoad === undefined) {
			this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
				'map_load_failed',
				(mapName: string, isBackgroundMap: boolean) => {
					if (!isBackgroundMap) return;
					$.Warning('!!!!! Could not load Campaign background map !!!!!');
					$.Schedule(0.001, () => {
						$.DispatchEvent('MainMenuSwitchReverse', false);
						GameInterfaceAPI.ConsoleCommand('disconnect');
						$.Schedule(0.1, () => {
							CampaignAPI.SetActiveCampaign(null);
							UiToolkitAPI.ShowGenericPopupOk(
								$.Localize('#MainMenu_Campaigns_BgLoadFailed_Title'),
								$.Localize('#MainMenu_Campaigns_BgLoadFailed_Description'),
								'bad-popup',
								() => {}
							);
						});
					});
				}
			);
		}

		const ch = CampaignAPI.GetCampaignMeta(null);
		const bgLevel = (ch['background_map'] as string) ?? '';
		const bgMusic = (ch['background_music'] as string) ?? '';
		const bgMovie = (ch['background_movie'] as string) ?? '';
		const bgImage = (ch['background_image'] as string) ?? '';

		if (bgLevel.length > 0) {
			$.DispatchEvent('MainMenuSetLoadingIndicatorVisibility', true);
			$.DispatchEvent('MainMenuShowBackgroundImage', bgImage, false);
			if (!skipBgMapLoad) {
				$.Msg(`Attempting to load background map ${bgLevel}`);
				GameInterfaceAPI.ConsoleCommand('startupmenu');
				//GameInterfaceAPI.ConsoleCommand(`map_background ${bgLevel}`);
			} else {
				$.Msg('Background map specified and default campaign specified, we will be doing nothing.');
			}
		} else if (bgMovie.length > 0) {
			$.DispatchEvent('MainMenuSwitchReverse', false);
			$.DispatchEvent('MainMenuHideBackgroundImage', true);
			$.DispatchEvent('MainMenuShowBackgroundMovie', bgMovie);
			if (bgMusic.length > 0) {
				this.music = $.PlaySoundEvent(bgMusic);
			}
		} else if (bgImage.length > 0) {
			$.DispatchEvent('MainMenuSwitchReverse', false);
			$.DispatchEvent('MainMenuShowBackgroundImage', bgImage, true);
			if (bgMusic.length > 0) {
				this.music = $.PlaySoundEvent(bgMusic);
			}
		} else {
			$.Warning('CAMPAIGN MENU: No background has been specified!');
		}
	}

	static stopMusic() {
		if (this.music) $.StopSoundEvent(this.music);
		this.music = undefined;
	}

	static onMapUnloaded() {
		this.stopMusic();
	}

	static reparent() {
		this.continueBtn.SetParent($.GetContextPanel());
		this.loadGameBtn.SetParent($.GetContextPanel());
	}
}
