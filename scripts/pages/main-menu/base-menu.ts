'use strict';

class BaseMenu {
	static buttons: MenuButton[] = [
		{
			id: 'DevBtn',
			headline: '#MainMenu_Navigation_Developer',
			tagline: '#MainMenu_Navigation_Developer_Tagline',
			dev: true,
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Dev', 'main-menu/developer', undefined);
			},
			focused: () => {
				this.hideContinueDetails();
			}
		},
		{
			id: 'PlayBtn',
			headline: '#MainMenu_Navigation_Play',
			tagline: '#MainMenu_Navigation_Play_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Play', 'play-menu/player-mode', undefined);
			},
			focused: () => {
				this.hideContinueDetails();
			}
		},
		{
			id: 'CampaignContinueBtn',
			headline: '#MainMenu_Campaigns_MM_Resume',
			tagline: '[PH] ????',
			activated: () => {
				const c = this.savCampaign!;
				const id = `${c.bucket.id}/${c.campaign.id}`;

				$.DispatchEvent('LoadingScreenClearLastMap');
				GameInterfaceAPI.ConsoleCommand('disconnect');
				CampaignAPI.ContinueCampaign(id);
			},
			hovered: () => {
				if (this.isContinueActive) return;
				if (!this.continueBtn.enabled) return;
				if (!this.savCampaign) return;
				if (!this.savChapter) return;

				this.isContinueActive = true;

				const meta =
					CampaignAPI.GetCampaignMeta(`${this.savCampaign.bucket.id}/${this.savCampaign.campaign.id}`) ??
					new Map<string, string>();
				if (meta.size === 0) {
					$.Warning('BASE MENU: Meta is invalid!');
				}
				const logoPath = meta.get(CampaignMeta.FULL_LOGO);
				if (logoPath !== undefined) {
					$.DispatchEvent('MainMenuSetLogo', `${getCampaignAssetPath(this.savCampaign)}${logoPath}`);

					const s = meta.get(CampaignMeta.LOGO_HEIGHT) ?? CampaignLogoSizePreset.STANDARD;
					$.DispatchEvent('MainMenuSetLogoSize', s);
				} else if (isBucketSingleWsCampaign(this.savCampaign.bucket)) {
					$.DispatchEvent('MainMenuSetLogo', 'file://{images}/campaigns/p2ce_ws/full_logo.svg');
					$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
				} else {
					$.DispatchEvent('MainMenuSetLogo', '');
				}

				this.continueLogo.AddClass('mainmenu__square-logo__anim');
				this.continueBox.visible = true;
			},
			unhovered: () => {
				this.hideContinueDetails();
			},
			focusIsHover: true
		},
		{
			id: 'AddonsBtn',
			headline: '#MainMenu_Navigation_Addons',
			tagline: '#MainMenu_Navigation_Addons_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Content', 'main-menu/addons', undefined);
			},
			focused: () => {
				this.hideContinueDetails();
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
				this.hideContinueDetails();
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
						$.Schedule(0.01, () => {
							GameInterfaceAPI.ConsoleCommand('quit');
						});
					},
					$.Localize('#Action_Return'),
					() => {},
					'blur'
				);
			},
			focused: () => {
				this.hideContinueDetails();
			}
		}
	];

	static latestSave: GameSave;
	static savCampaign: CampaignPair | undefined = undefined;
	static savChapter: ChapterInfo | undefined = undefined;
	static isContinueActive: boolean = false;

	static continueBtn: Button;
	static continueLogo: Image;
	static continueText: Label;
	static continueBox = $<Panel>('#ContinueBox')!;
	static continueBoxText = $<Label>('#ContinueSaveTagline')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;

	static bgMapLoad: uuid | undefined = undefined;

	static mapSelection = 0;
	static maps = [
		'p2ce_background_chmb18_ovg',
		'p2ce_background_laser_intro',
		'p2ce_background_gentle_hum',
		'p2ce_background_mikatastrophe-dark'
	];
	static music;

	static onLoad() {
		for (const btn of this.buttons) {
			if (btn.id === 'CampaignContinueBtn') {
				const b = constructMenuButton(btn);
				this.continueBtn = b;
				this.continueBtn.AddClass('mainmenu__nav__btn__no-gradient');

				const text = b.FindChildTraverse('CampaignContinueBtn_Tagline');

				if (text) {
					this.continueText = text as Label;
				} else {
					throw new Error('Cannot find tagline text for resume button!');
				}

				$.DispatchEvent('MainMenuAddPreConstructedButton', b);

				continue;
			}

			$.DispatchEvent('MainMenuAddButton', btn);
		}

		$.RegisterForUnhandledEvent('MainBackgroundLoaded', () => {
			this.showPrereleaseWarning();
			if (GameStateAPI.IsPlaytest()) this.showPlaytestConsentPopup();

			const music = `UIPanorama.Music.P2CE.Menu${Math.floor(Math.random() * 2) + 1}`;
			this.music = $.PlaySoundEvent(music);
		});

		$.RegisterForUnhandledEvent('MapUnloaded', () => {
			this.stopMusic();
		});

		$.RegisterForUnhandledEvent('MainMenuModeRequestCleanup', () => {
			this.stopMusic();
		});

		$.RegisterForUnhandledEvent('MainMenuAnimatedSwitch', (c: string) => {
			// this should be changed in the future for more fluid animation swap
			// but because of how things work right now, we'll just do it "instantly"
			GameInterfaceAPI.ConsoleCommand('disconnect');
			$.Schedule(0.01, () => {
				$.DispatchEvent('MainMenuSwitchFade', true, true);
				$.Schedule(0.01, () => {
					$.Msg('BASE MENU: Switching campaign');
					if (!CampaignAPI.SetActiveCampaign(c)) {
						$.Warning(`BASE MENU: Failed to set campaign to ${c}!!!!`);
					}
				});
			});
		});

		$.DispatchEvent('MainMenuSetLogo', 'file://{images}/logo.svg');
		$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);

		// create Resume details
		const p = $.CreatePanel('Panel', $.GetContextPanel(), 'MenuBackgroundLayer');
		p.SetReadyForDisplay(false);
		p.LoadLayoutSnippet('MenuBackgroundLayer');
		$.DispatchEvent('MainMenuAddBgPanel', p);

		const logo = p.FindChildTraverse('ContinueSaveLogo');
		if (logo) {
			this.continueLogo = logo as Image;
		} else {
			throw new Error('ContinueSaveLogo could not be found.');
		}

		this.setContinueDetails();

		$.DispatchEvent('MainMenuHideBackgroundMovie');

		// load featured Background
		this.loadBackground();
	}

	static stopMusic() {
		if (this.music) $.StopSoundEvent(this.music);
		this.music = undefined;
	}

	static setContinueDetails() {
		this.continueBtn.enabled = false;
		this.continueBtn.visible = false;
		this.continueBox.visible = false;

		const saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		this.savCampaign = undefined;
		this.savChapter = undefined;

		if (saves.length === 0) {
			$.Warning('RESUME: No saves');
			return;
		}

		let savCampaign: CampaignPair | undefined;
		for (const save of saves) {
			savCampaign = CampaignAPI.FindCampaign(save.mapGroup) ?? undefined;
			if (!savCampaign) {
				$.Warning('RESUME: Newer save found without a map group. Skipping.');
			} else {
				$.Msg(`RESUME: Eligible save found: ${save.fileName}, ${save.mapName}, ${save.mapGroup}`);
				this.latestSave = save;
				break;
			}
		}

		if (!savCampaign) {
			$.Warning('RESUME: Could not find an eligible latest save');
			return;
		}

		const savChapter: ChapterInfo | undefined =
			this.latestSave.chapter < savCampaign.campaign.chapters.length
				? savCampaign.campaign.chapters[this.latestSave.chapter]
				: undefined;

		if (!savChapter) {
			$.Warning('RESUME: Map could not be found for Campaign');
			return;
		}

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);
		const meta =
			CampaignAPI.GetCampaignMeta(`${savCampaign.bucket.id}/${savCampaign.campaign.id}`) ??
			new Map<string, string>();
		if (meta.size === 0) {
			$.Warning('BASE MENU: Meta is invalid!');
		}
		this.continueLogo.SetImage(`${getCampaignAssetPath(savCampaign)}${meta.get(CampaignMeta.SQUARE_LOGO)}`);

		this.continueText.text = `${$.Localize(savCampaign.campaign.title)}`;

		const date = new Date(Number(this.latestSave.fileTime));
		const chapterName = $.Localize(savChapter.title);

		this.continueBoxText.text = `${chapterName.replace('\n', ': ')}\n${convertTime(date, false)}`;

		this.continueBtn.enabled = true;
		this.continueBtn.visible = true;

		this.savCampaign = savCampaign;
		this.savChapter = savChapter;
	}

	static rerollMap() {
		this.mapSelection = Math.floor(Math.random() * this.maps.length);
		$.Msg(`BASE MENU: Rolled background map: ${this.mapSelection}, ${this.maps[this.mapSelection]}`);
		$.DispatchEvent(
			'MainMenuSetBackgroundImage',
			`file://{images}/menu/featured/${this.maps[this.mapSelection]}.png`
		);
	}

	static loadNoRoll() {
		// TODO: check for BG Map Option
		// eslint-disable-next-line no-constant-condition
		if (true) {
			this.loadStaticBg();
		} else {
			this.loadLiveBg();
		}
	}

	static loadBackground() {
		this.rerollMap();
		this.loadNoRoll();
	}

	static loadStaticBg() {
		$.DispatchEvent('MainMenuShowBackgroundImage', undefined, true);
		$.DispatchEvent('MainMenuSwitchReverse', false);

		$.RegisterForUnhandledEvent('MapLoaded', (map: string, bg: boolean) => {
			if (bg) {
				$.Msg('BASE MENU: Background map load detected. Turning off background image/movie.');
				$.DispatchEvent('MainMenuHideBackgroundImage', undefined);
				$.DispatchEvent('MainMenuHideBackgroundMovie');
			}
		});

		$.DispatchEvent('MainBackgroundLoaded');
	}

	static loadLiveBg() {
		// load up a random map from our pool
		$.DispatchEvent('MainMenuSetLoadingIndicatorVisibility', true);

		// set fallback
		$.DispatchEvent('MainMenuShowBackgroundImage', undefined, false);

		if (this.bgMapLoad === undefined) {
			this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
				'map_load_failed',
				(mapName: string, isBackgroundMap: boolean) => {
					if (!isBackgroundMap || mapName !== `maps\\${this.maps[this.mapSelection]}.bsp`) return;
					$.Warning('!!!!! Could not load featured background map !!!!!');
					$.Schedule(0.001, () => {
						$.DispatchEvent('MainMenuSwitchReverse', false);
						$.DispatchEvent('MainBackgroundLoaded');
					});
				}
			);
		}

		$.RegisterForUnhandledEvent('MapLoaded', (map: string, bg: boolean) => {
			if (bg && map === `maps\\${this.maps[this.mapSelection]}.bsp`) {
				$.DispatchEvent('MainMenuHideBackgroundImage', false);
				$.DispatchEvent('MainMenuSwitchReverse', false);
				$.DispatchEvent('MainBackgroundLoaded');
			} else {
				$.Warning(
					`BASE MENU: Map loaded, but it failed to pass base bg map check. bgLevel = ${this.maps[this.mapSelection]}, map = ${map}, bg: ${bg}`
				);
			}
		});

		$.Schedule(0.1, () => {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			GameInterfaceAPI.ConsoleCommand(`map_background "${this.maps[this.mapSelection]}"`);
		});
	}

	/**
	 * Shows playtest consent form
	 */
	static showPlaytestConsentPopup() {
		if (!DosaHandler.checkDosa('playtestConsent'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/playtest-consent.xml',
				'dosaKey=playtestConsent&dosaNameToken=Dosa_PlaytestConsent'
			);
	}

	/**
	 * Shows prerelease notice form
	 */
	static showPrereleaseWarning() {
		if (!DosaHandler.checkDosa('prereleaseAck'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/prerelease-warn-dialog.xml',
				'dosaKey=prereleaseAck&dosaNameToken=Dosa_PrereleaseAck'
			);
	}

	static hideContinueDetails() {
		if (!this.isContinueActive) return;

		this.isContinueActive = false;

		if (!this.continueBox.IsValid()) return;

		$.DispatchEvent('MainMenuSetLogo', 'file://{images}/logo.svg');
		$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);

		this.continueBox.visible = false;

		this.continueLogo.RemoveClass('mainmenu__square-logo__anim');
	}

	// prevents crash by bringing back the panels that were placed outside of this layout file
	static reparent() {
		this.continueBtn.SetParent($.GetContextPanel());
	}
}
