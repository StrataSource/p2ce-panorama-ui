'use strict';

class MainMenuCampaignMode {
	static movie = $<Movie>('#MainMenuMovie')!;
	static imgBg = $<Image>('#MainMenuBackground')!;

	static logo = $<Image>('#GameFullLogo')!;
	static campaignDevTxt = $<Label>('#DevCampaign')!;
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
		$.RegisterForUnhandledEvent('SetActiveUiCampaign', this.onCampaignSelected.bind(this));
		$.RegisterForUnhandledEvent('ReloadBackground', this.reloadBackground.bind(this));
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
		$.RegisterForUnhandledEvent('MapUnloaded', this.onMapUnloaded.bind(this));
		$.RegisterForUnhandledEvent('MainMenuFullBackNav', this.onFullBackNav.bind(this));
	}

	static onMainMenuShown() {
		if (this.selectedCampaign === undefined) return;

		this.setContinueDetails();
		this.setCampaignMenuDetails();
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
		// TODO: Grab active campaign from API instead of this
		if (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] === undefined) return;

		if (isBackgroundMap && this.loadingMap) {
			this.loadingMap = false;
			MenuAnimation.switchReverse();

			// background maps take priority, turn these off
			if (this.movie) this.movie.visible = false;
			MenuAnimation.hideBgImg();

			const bgmu = CampaignAPI.GetBackgroundMusic();
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

		const bgl = CampaignAPI.GetBackgroundLevel();
		const bgm = CampaignAPI.GetBackgroundMovie();
		const bgi = CampaignAPI.GetBackgroundImage();

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
							$.Warning('!!!!! Background map was specified, but it failed to load! Exiting campaign !!!!!');
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
			this.movie.visible = true;
			$.Schedule(0.001, () => {
				this.music = $.PlaySoundEvent(CampaignAPI.GetBackgroundMusic());
			});
		} else if (bgi.length > 0) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			MenuAnimation.showBgImg(true);
			this.imgBg.SetImage(`file://${bgi}`);
			this.movie.visible = false;
			$.Schedule(0.001, () => {
				this.music = $.PlaySoundEvent(CampaignAPI.GetBackgroundMusic());
			});
		}

		return bgl.length > 0;
	}

	static onCampaignSelected(id: string) {
		$.Msg(`Begin searching for campaign: ${id}`);
		const campaign = CampaignAPI.GetAllCampaigns().find((v) => {
			return v.id === id;
		});
		if (!campaign) {
			$.Warning(`Menu: Campaign ID ${id} received but that's not a valid Campaign?`);
			return;
		} else if (this.selectedCampaign && this.selectedCampaign.id === id) {
			$.Warning(`Campaign ${id} already active. Doing nothing.`);
			return;
		}

		this.selectedCampaign = campaign;
		$.Msg(`Switching campaign to: ${this.selectedCampaign.id}`);
		if (!CampaignAPI.SetActiveCampaign(this.selectedCampaign.id)) {
			$.Warning('JS: SetActiveCampaign failed!');
		}
		// TODO: Grab active campaign from API instead of this
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] = campaign;

		$.GetContextPanel().AddClass('CampaignSelected');
		$('#NewGameBtn')!.SetFocus(true);

		// TODO: Set logo image appropriately
		let saveImg = 'file://{images}/menu/portal2/full_logo.svg';
		this.logo.visible = true;
		switch (this.selectedCampaign.id) {
			case 'portal1_sp':
				saveImg = 'file://{images}/menu/portal/full_logo.svg';
				break;

			case 'hl2':
				saveImg = 'file://{images}/menu/hl2/full_logo.svg';
				break;

			case 'episodic':
				saveImg = 'file://{images}/menu/episodic/full_logo.svg';
				break;

			case 'ep2':
				saveImg = 'file://{images}/menu/ep2/full_logo.svg';
				break;
		}
		this.logo.SetImage(saveImg);
		this.campaignDevTxt.text = `[DEV] Campaign: ${$.Localize(campaign.title)} (${id})`;

		this.setContinueDetails();
	}

	static reloadBackground() {
		// TODO: Grab active campaign from API instead of this
		if (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] === undefined) return;

		if (!this.setCampaignMenuDetails()) {
			MenuAnimation.switchReverse();
		}
	}

	static exitCampaign() {
		// TODO: Grab active campaign from API instead of this
		// must block subsequent requests to exit campaign
		// (this only happens on controller because for some reason buttons
		// that are disabled can still be activated if focused)
		if (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] === undefined)
			return;
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] = undefined;
		this.selectedCampaign = undefined;

		$.DispatchEvent('MainMenuSwitchFade');
		$.Schedule(0.5, () => {
			this.continueBtn.RemoveClass('mainmenu__nav__btn__no-gradient');
			this.logo.SetImage('file://{images}/logo.svg');
			this.campaignDevTxt.text = '[DEV] No campaign active';
			$.GetContextPanel().RemoveClass('CampaignSelected');
			$.DispatchEvent('ReloadBackground');
			MainMenu.setContinueDetails();
		});
	}
}
