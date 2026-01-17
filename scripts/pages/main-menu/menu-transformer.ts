'use strict';

class MainMenuCampaignMode {
	static movie = $<Movie>('#MainMenuMovie')!;
	static imgBg = $<Image>('#MainMenuBackground')!;

	static logo = $<Image>('#GameFullLogo')!;
	static menuContent = $<Panel>('#MenuContentRoot')!;
	static switchBlur = $<Panel>('#SwitcherBlur')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static loadingIndicator = $<Label>('#LoadingIndicator')!;

	static selectedCampaign: CampaignInfo | undefined = undefined;

	static continueBtn = $<Button>('#CampaignContinueBtn')!;
	static continueText = $<Label>('#ContinueCampaignText')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueLogo = $<Image>('#ContinueSaveLogo')!;
	static continueHeadline = $<Label>('#ContinueSaveHeadline')!;
	static continueTagline = $<Label>('#ContinueSaveTagline')!;
	static loadGameBtn = $<Button>('#LoadGameBtn')!;

	static latestSave: GameSave;

	static isBlurred = false;

	static music;

	static bgMapLoad: uuid | undefined = undefined;
	static loadingMap: boolean = false;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('ShowMainMenu', this.onMainMenuShown.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onPauseMenuShown.bind(this));
		$.RegisterForUnhandledEvent(
			'PanoramaComponent_Campaign_OnActiveCampaignChanged',
			this.onCampaignSelected.bind(this)
		);
		$.RegisterForUnhandledEvent('ReloadBackground', this.reloadBackground.bind(this));
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
		$.RegisterForUnhandledEvent('MapUnloaded', this.onMapUnloaded.bind(this));
		$.RegisterForUnhandledEvent('MainMenuFullBackNav', this.onFullBackNav.bind(this));
	}

	static onMainMenuShown() {
		if (this.selectedCampaign === undefined) return;

		this.setContinueDetails();
		if (this.setCampaignMenuDetails()) MenuAnimation.switchFade(true);
	}

	static onPauseMenuShown() {
		if (this.selectedCampaign === undefined) {
			MainMenu.setContinueDetails();
		} else {
			this.setContinueDetails();
		}
	}

	static onFullBackNav() {
		this.setContinueDetails();
	}

	static setContinueDetails() {
		if (this.selectedCampaign === undefined) return;

		this.continueLogo.visible = false;
		this.continueTagline.visible = false;

		const saves = GameSavesAPI.GetGameSaves()
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime))
			.filter((a) => {
				return a.mapGroup === this.selectedCampaign!.id;
			});

		this.continueBtn.enabled = false;
		this.continueBtn.visible = true;
		this.continueText.text = $.Localize('MainMenu_SaveRestore_NoSaves');

		// disable the saves menu in the main menu
		// always be enabled to allow creation of saves in game

		this.loadGameBtn.enabled = true;

		if (saves.length === 0) {
			$.Warning('CONTINUE: No saves');

			if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) this.loadGameBtn.enabled = false;

			return;
		}

		// set the continue button states

		this.latestSave = saves[0];

		const savChapter = this.selectedCampaign.chapters.find((ch) => {
			return (
				ch.maps.find((map) => {
					return map.name === this.latestSave.mapName || map.name === `${this.latestSave.mapName}.bsp`;
				}) !== undefined
			);
		});

		if (!savChapter) {
			$.Warning('CONTINUE: Map could not be found for Campaign');
			return;
		}

		//const chapterString = `[${this.selectedCampaign.chapters.indexOf(savChapter!) + 1} / ${this.selectedCampaign.chapters.length}]`;

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		this.continueText.text = `${$.Localize(savChapter.title)}`;
		const date = new Date(Number(this.latestSave.fileTime));
		this.continueHeadline.text = convertTime(date);

		this.continueBtn.SetPanelEvent('onactivate', () => {
			if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_LoadGame_Confirm'),
					$.Localize('#Action_LoadGame_Auto_Message'),
					'warning-popup',
					$.Localize('#Action_LoadGame'),
					() => {
						CampaignAPI.ContinueCampaign(this.selectedCampaign!.id);
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			} else {
				CampaignAPI.ContinueCampaign(this.selectedCampaign!.id);
			}
		});

		this.continueBtn.enabled = true;
		this.continueBtn.AddClass('mainmenu__nav__btn__no-gradient');
	}

	static onBackgroundMapLoaded(map: string, isBackgroundMap: boolean) {
		if (CampaignAPI.GetActiveCampaign() === null) return;

		if (isBackgroundMap && this.loadingMap) {
			this.loadingMap = false;
			MenuAnimation.switchReverse();

			// background maps take priority, turn these off
			if (this.movie.IsValid()) this.movie.visible = false;
			MenuAnimation.hideBgImg();

			const meta = CampaignAPI.GetCampaignMeta(null);
			const bgmu = meta['background_music'] ?? '';
			$.Msg(bgmu);
			if (bgmu) this.music = $.PlaySoundEvent(bgmu);
		}
	}

	static stopMusic() {
		if (this.music) $.StopSoundEvent(this.music);
		this.music = undefined;
	}

	static onMapUnloaded() {
		this.stopMusic();
	}

	// set campaign details
	// background map takes priority
	// then background movie
	// then background image
	//
	// this function returns true if the reverse anim should be delayed
	static setCampaignMenuDetails() {
		this.movie = $<Movie>('#MainMenuMovie')!;

		const meta = CampaignAPI.GetCampaignMeta(null);
		const bgs = meta['background_music'] ?? '';
		const bgl = meta['background_map'] ?? '';
		const bgm = meta['background_movie'] ?? '';
		const bgi = meta['background_image'] ?? '';

		$.Msg(`Music: ${bgs}, Level: ${bgl}, Movie: ${bgm}, Image: ${bgi}`);

		MainMenu.stopMusic();

		if (bgl.length > 0) {
			MenuAnimation.showBgImg();
			this.imgBg.SetImage(`file://${bgi}`);
			this.loadingMap = true;
			$.Schedule(MenuAnimation.BACKGROUND_IMAGE_FADE_IN_TIME, () => {
				this.loadingIndicator.visible = true;
				if (!this.bgMapLoad) {
					$.Msg('Campaign BG fail event created');
					this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
						'map_load_failed',
						(mapName: string, isBackgroundMap: boolean) => {
							if (!isBackgroundMap || !this.loadingMap) return;
							this.loadingMap = false;
							$.Warning(
								'!!!!! Background map was specified, but it failed to load! Exiting campaign !!!!!'
							);
							MainMenu.addToReturnQueue(() => {
								UiToolkitAPI.ShowGenericPopupOk(
									$.Localize('#Popup_CampaignBgLoadFailed'),
									$.Localize('#Popup_CampaignBgLoadFailed_Message'),
									'bad-popup',
									() => {
										MainMenu.onMainMenuFocused();
									}
								);
							});
							this.exitCampaign();
						}
					);
				}
				GameInterfaceAPI.ConsoleCommand(`map_background ${bgl}`);
			});
		} else if (bgm.length > 0) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			MenuAnimation.hideBgImg(true);
			this.movie.SetMovie(`file://{game}/${bgm}`);
			this.movie.Play();
			if (this.movie.IsValid()) this.movie.visible = true;
			$.Schedule(0.001, () => {
				this.music = $.PlaySoundEvent(bgs);
			});
		} else if (bgi.length > 0) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			MenuAnimation.showBgImg(true);
			this.imgBg.SetImage(`file://${bgi}`);
			if (this.movie.IsValid()) this.movie.visible = false;
			$.Schedule(0.001, () => {
				this.music = $.PlaySoundEvent(bgs);
			});
		}

		return bgl.length > 0;
	}

	static onCampaignSelected(id: string | null) {
		if (id === null) return;

		const campaign = CampaignAPI.GetAllCampaigns().find((v) => {
			return v.id === id;
		});
		if (!campaign) {
			$.Warning(`Menu: Campaign ID ${id} received but that's not a valid Campaign?`);
			return;
		}

		if (campaign.id === 'empty') {
			$.Msg('Going to base state');
			return;
		}

		$.Msg(`set campaign to ${id}`);

		this.selectedCampaign = campaign;

		$.GetContextPanel().AddClass('CampaignSelected');

		const logoPath = this.selectedCampaign.meta[CampaignMeta.FULL_LOGO];
		if (logoPath !== undefined) {
			this.logo.SetImage(`file://${logoPath}`);
		} else {
			this.logo.visible = false;
		}

		if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
			$.DispatchEvent('MainMenuCloseAllPages');
			$.DispatchEvent('MainMenuSwitchFade');
			$.Schedule(0.5, () => {
				this.setContinueDetails();
				$.DispatchEvent('ReloadBackground');
			});
		}
	}

	static reloadBackground() {
		if (CampaignAPI.GetActiveCampaign() === null) return;

		MainMenu.hideFeaturedBtn();

		if (!this.setCampaignMenuDetails()) {
			MenuAnimation.switchReverse();
		}
	}

	static exitCampaign() {
		// must block subsequent requests to exit campaign
		// (this only happens on controller because for some reason buttons
		// that are disabled can still be activated if focused)
		if (CampaignAPI.GetActiveCampaign() === null) return;
		this.selectedCampaign = undefined;
		$.DispatchEvent('MainMenuSwitchFade');
		$.Schedule(0.5, () => {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			$.Schedule(0.01, () => {
				CampaignAPI.SetActiveCampaign(null);
				$.Schedule(0.01, () => {
					this.logo.visible = true;
					this.continueBtn.RemoveClass('mainmenu__nav__btn__no-gradient');
					this.logo.SetImage('file://{images}/logo.svg');
					$.GetContextPanel().RemoveClass('CampaignSelected');
					$.DispatchEvent('ReloadBackground');
					MainMenu.setContinueDetails();
				});
			});
		});
	}
}
