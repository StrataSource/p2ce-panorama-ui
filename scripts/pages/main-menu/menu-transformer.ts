'use strict';

class MainMenuCampaignMode {
	static movie = $<Movie>('#MainMenuMovie')!;

	static logo = $<Image>('#GameFullLogo')!;
	static campaignDevTxt = $<Label>('#DevCampaign')!;
	static menuContent = $<Panel>('#MenuContentRoot')!;
	static switchBlur = $<Panel>('#SwitcherBlur')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static imgBg = $<Image>('#MainMenuBackground')!;
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

	// constants
	static BACKGROUND_IMAGE_FADE_IN_TIME = 0.25;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('ShowMainMenu', this.onMainMenuShown.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onPauseMenuShown.bind(this));
		$.RegisterForUnhandledEvent('SetActiveUiCampaign', this.onCampaignSelected.bind(this));
		$.RegisterForUnhandledEvent('MainMenuSwitchFade', this.switchFade.bind(this));
		$.RegisterForUnhandledEvent('ReloadBackground', this.reloadBackground.bind(this));
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
		$.RegisterForUnhandledEvent('MapUnloaded', this.onMapUnloaded.bind(this));
		$.RegisterForUnhandledEvent('MainMenuFullBackNav', this.onFullBackNav.bind(this));

		this.loadingIndicator.visible = false;
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

		const chapterString = `(${this.selectedCampaign.chapters.indexOf(savChapter!) + 1} / ${this.selectedCampaign.chapters.length})`;

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		this.continueText.text = `${chapterString} ${$.Localize(savChapter.title)}`;
		this.continueHeadline.text = `${this.latestSave.mapName}`;
		const date = new Date(Number(this.latestSave.fileTime) * 1000);
		this.continueTagline.text = `${date.toDateString()}, ${date.toLocaleTimeString()}`;

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
	}

	static showBgImg() {
		this.imgBg.style.animation = `FadeOut ${this.BACKGROUND_IMAGE_FADE_IN_TIME}s ease-out 0s 1 reverse forwards`;
	}

	static hideBgImg() {
		this.imgBg.style.animation = 'FadeOut 3.5s ease-out 0s 1 normal forwards';
	}

	static onBackgroundMapLoaded(map: string, isBackgroundMap: boolean) {
		if (isBackgroundMap) {
			this.switchReverse();

			// background maps take priority, turn these off
			if (this.movie) this.movie.visible = false;
			this.hideBgImg();

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
			this.showBgImg();
			this.imgBg.SetImage(`file://${bgi}`);
			$.Schedule(this.BACKGROUND_IMAGE_FADE_IN_TIME, () =>
				GameInterfaceAPI.ConsoleCommand(`map_background ${bgl}`)
			);
		} else if (bgm.length > 0) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			this.movie.SetMovie(`file://{game}/${bgm}`);
			this.movie.Play();
			this.movie.visible = true;
			$.Schedule(0.001, () => {
				this.music = $.PlaySoundEvent(CampaignAPI.GetBackgroundMusic());
			});
		} else if (bgi.length > 0) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			this.showBgImg();
			this.imgBg.SetImage(`file://${bgi}`);
			this.movie.visible = false;
			$.Schedule(0.001, () => {
				this.music = $.PlaySoundEvent(CampaignAPI.GetBackgroundMusic());
			});
		}

		return bgl.length > 0;
	}

	static switchFade() {
		this.movie = $<Movie>('#MainMenuMovie')!;
		this.movie.Stop();

		this.menuContent.AddClass('mainmenu__content__t-prop');
		this.menuContent.AddClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-switch-reverse');
		this.switchBlur.AddClass('anim-main-menu-switch');

		this.isBlurred = true;
	}

	static switchReverse() {
		if (!this.isBlurred) return;

		this.menuContent.RemoveClass('mainmenu__content__t-prop');
		this.menuContent.RemoveClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-switch');
		this.switchBlur.AddClass('anim-main-menu-switch-reverse');
		this.pageInsert.RemoveAndDeleteChildren();

		this.isBlurred = false;
		this.loadingIndicator.visible = false;
	}

	static onCampaignSelected(id: string) {
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
		CampaignAPI.SetActiveCampaign(this.selectedCampaign.id);
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

		this.loadingIndicator.visible = true;
		if (!this.setCampaignMenuDetails()) {
			this.switchReverse();
		}
	}

	static exitCampaign() {
		// TODO: Grab active campaign from API instead of this
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] = undefined;
		this.selectedCampaign = undefined;

		$.DispatchEvent('MainMenuSwitchFade');
		$.Schedule(0.5, () => {
			this.logo.SetImage('file://{images}/logo.svg');
			this.campaignDevTxt.text = '[DEV] No Campaign Active';
			$.GetContextPanel().RemoveClass('CampaignSelected');
			$.DispatchEvent('ReloadBackground');
			MainMenu.setContinueDetails();
		});
	}
}
