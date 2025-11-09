'use strict';



class MainMenu {
	static panels = {
		cp: $.GetContextPanel(),
		pageContent: $('#PageContent'),
		homeContent: $('#HomeContent'),
		pauseContent: $('#PauseContent'),
		contentBlur: $('#MainMenuContentBlur'),
		backgroundBlur: $('#MainMenuBackgroundBlur'),
		movie: $<Movie>('#MainMenuMovie'),
		image: $<Image>('#MainMenuBackground'),
		model: $<ModelPanel>('#MainMenuModel'),
		topButtons: $('#MainMenuTopButtons'),
		homeButton: $<RadioButton>('#HomeButton'),
		addonsButton: $<RadioButton>('#AddonsButton'),
		pausedLoadLastSaveButton: $<Button>('#PausedLoadLastSaveButton'),
		mainMenuViewSavesButton: $<Button>('#MainMenuViewSavesButton'),
		mainMenuLoadLastSaveButton: $<Button>('#MainMenuLoadLastSaveButton'),
		mainMenuSaveImage: $<Image>('#MainMenuSaveImage'),
		mainMenuSaveSubheadingLabel: $<Label>('#MainMenuSaveSubheadingLabel'),
		pausedSaveImage: $<Image>('#PausedSaveImage'),
	};

	static activeTab = '';
	static inSpace = false; // Temporary fun...

	static {
		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		$.RegisterForUnhandledEvent('HideMainMenu', this.onHideMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onShowPauseMenu.bind(this));
		$.RegisterForUnhandledEvent('HidePauseMenu', this.onHidePauseMenu.bind(this));
		$.RegisterForUnhandledEvent('ReloadBackground', this.setMainMenuDetails.bind(this));
		$.RegisterEventHandler('Cancelled', $.GetContextPanel(), this.onEscapeKeyPressed.bind(this));
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
		$.RegisterForUnhandledEvent('MapUnloaded', this.onMapUnloaded.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', this.onLayoutReloaded.bind(this));

		$.DispatchEvent('HideIntroMovie');
	}

	/**
	 * General onLoad initialisations.
	 * Fired when MainMenu fires its onload event.
	 */
	static onMainMenuLoaded() {
		// These aren't accessible until the page has loaded fully, find them now
		this.panels.movie = $<Movie>('#MainMenuMovie');
		this.panels.model = $<ModelPanel>('#MainMenuModel');

		if (GameInterfaceAPI.GetSettingInt('sv_unlockedchapters') >= 5) this.inSpace = true;
		else this.inSpace = Math.floor(Math.random() * 100) === 1; // 1% chance of being ejected

		// Assign a random model
		const models = [
			'models/panorama/menu/BotPoses.mdl',
			'models/panorama/menu/sp_a2_bridge_the_gap_WHEATLEY.mdl',
			'models/panorama/menu/sp_a1_wakeup_glados_MERGED.mdl',
			'models/props/schrodinger_cube.mdl',
			'models/props/reflection_cube.mdl',
			'models/props/metal_box.mdl'
		];

		if (this.panels.model) {
			this.panels.model.src = models[Math.floor(Math.random() * models.length)]; // Pick a random model

			this.panels.model.SetModelRotationSpeedTarget(0, this.inSpace ? 0.02 : 0.05, this.inSpace ? 0.02 : 0);
			this.panels.model.SetMouseXRotationScale(0, 1, 0); // By default mouse X will rotate the X axis, but we want it to spin Y axis
			this.panels.model.SetMouseYRotationScale(0, 0, 0); // Disable mouse Y movement rotations

			this.panels.model.LookAtModel();
			this.panels.model.SetCameraOffset(-300, 0, 0);
			this.panels.model.SetCameraFOV(30);

			this.panels.model.SetDirectionalLightColor(0, 0.5, 0.5, 0.5);
			this.panels.model.SetDirectionalLightDirection(0, 1, 0, 0);
		}

		$('#ControlsLibraryButton')?.SetHasClass('hide', !GameInterfaceAPI.GetSettingBool('developer'));

		this.setMainMenuDetails();

		if (GameStateAPI.IsPlaytest()) this.showPlaytestConsentPopup();

		stripDevTagsFromLabels($.GetContextPanel());
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
	 * Fired by C++ whenever main menu is switched to.
	 */
	static onShowMainMenu() {
		this.panels.movie = $<Movie>('#MainMenuMovie');
		this.panels.image = $<Image>('#MainMenuBackground');

		this.setMainMenuDetails();
		this.onHomeButtonPressed();

		this.updateHomeDetails();
	}

	/**
	 * Fired by C++ whenever main menu is switched from.
	 */
	static onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
	}

	/**
	 * Fired by C++ whenever pause menu (i.e. main menu when in a map) is switched to.
	 */
	static onShowPauseMenu() {
		this.panels.cp.AddClass('MainMenuRootPanel--PauseMenuMode');
		this.onHomeButtonPressed();

		this.updateHomeDetails();
	}

	/**
	 * Fired by C++ whenever pause menu is switched from.
	 */
	static onHidePauseMenu() {
		this.panels.cp.RemoveClass('MainMenuRootPanel--PauseMenuMode');

		// Save to file whenever the settings page gets closed
		if (this.activeTab === 'Settings') {
			$.DispatchEvent('SettingsSave');
		}
	}

	/**
	 * Updates the elements within the homepages
	 * e.g. disabling buttons related to loading saves if there are no saves available
	 */
	static updateHomeDetails() {
		const saves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time);
		const hasSaves = saves.length !== 0;

		if (this.panels.pausedLoadLastSaveButton) this.panels.pausedLoadLastSaveButton.enabled = hasSaves;

		if (this.panels.mainMenuViewSavesButton) this.panels.mainMenuViewSavesButton.enabled = hasSaves;

		if (this.panels.mainMenuLoadLastSaveButton) this.panels.mainMenuLoadLastSaveButton.enabled = hasSaves;

		if (hasSaves) {
			const save = saves[0];
			const thumbValid = save.thumb.length > 0;
			const savePath = `file://${save.thumb}`;

			if (this.panels.mainMenuSaveImage && thumbValid) this.panels.mainMenuSaveImage.SetImage(savePath);
			if (this.panels.pausedSaveImage && thumbValid) this.panels.pausedSaveImage.SetImage(savePath);

			if (this.panels.mainMenuSaveSubheadingLabel) this.panels.mainMenuSaveSubheadingLabel.text = save.name;
		}
	}

	/**
	 * Switch main menu page
	 */
	static navigateToPage(tab: string, xmlName: string, hasBlur = true) {
		if (this.panels.contentBlur) this.panels.contentBlur.visible = hasBlur;

		// Check to see if tab to show exists.
		// If not load the xml file.
		if (!this.panels.cp.FindChildInLayoutFile(tab) && this.panels.pageContent) {
			const newPanel = $.CreatePanel('Panel', this.panels.pageContent, tab);

			newPanel.LoadLayout(`file://{resources}/layout/pages/${xmlName}.xml`, false, false);
			newPanel.RegisterForReadyEvents(true);
			stripDevTagsFromLabels(newPanel);

			// Handler that catches PropertyTransitionEndEvent event for this panel.
			// Check if the panel is transparent then collapse it.
			$.RegisterEventHandler('PropertyTransitionEnd', newPanel, (panelName, propertyName) => {
				if (newPanel.id === panelName && propertyName === 'opacity') {
					// Panel is visible and fully transparent
					if (newPanel.visible === true && newPanel.IsTransparent()) {
						// Set visibility to false and unload resources
						newPanel.visible = false;
						newPanel.SetReadyForDisplay(false);
						return true;
					} else if (newPanel.visible === true) {
						$.DispatchEvent('MainMenuTabShown', tab);
					}
				}
				return false;
			});
		}

		// If a we have a active tab and it is different from the selected tab hide it.
		// Then show the selected tab
		if (this.activeTab !== tab) {
			// If the tab exists then hide it
			if (this.activeTab) {
				const panelToHide = this.panels.cp.FindChildInLayoutFile(this.activeTab);
				panelToHide?.AddClass('mainmenu__page-container--hidden');

				$.DispatchEvent('MainMenuTabHidden', this.activeTab);
			}

			// Show selected tab
			this.activeTab = tab;
			const activePanel = this.panels.cp.FindChildInLayoutFile(tab);
			activePanel?.RemoveClass('mainmenu__page-container--hidden');

			// Force a reload of any resources since we're about to display the panel
			if (activePanel) activePanel.visible = true;
			activePanel?.SetReadyForDisplay(true);
			$.DispatchEvent('MainMenuTabShown', this.activeTab);
		}

		this.showContentPanel();
	}

	/**
	 * Show the main menu page container and retract the drawer.
	 */
	static showContentPanel() {
		this.panels.pageContent?.RemoveClass('mainmenu__page-container--hidden');

		$.DispatchEvent('RetractDrawer');
		$.DispatchEvent('ShowContentPanel');

		this.panels.homeContent?.AddClass('mainmenu__home-container--hidden');
		this.panels.pauseContent?.AddClass('mainmenu__home-container--hidden');
	}

	/**
	 * Hide the main menu page container and active page, and display the home page content.
	 */
	static onHideContentPanel() {
		this.panels.pageContent?.AddClass('mainmenu__page-container--hidden');

		// Uncheck the active button in the main menu navbar.
		const activeButton = this.panels.topButtons?.Children().find((panel) => panel.IsSelected());
		if (activeButton && activeButton.id !== 'HomeButton') {
			activeButton.checked = false;
		}

		// If the tab exists then hide it
		if (this.activeTab) {
			const panelToHide = this.panels.cp.FindChildInLayoutFile(this.activeTab);
			if (panelToHide) panelToHide.AddClass('mainmenu__page-container--hidden');

			$.DispatchEvent('MainMenuTabHidden', this.activeTab);
		}

		this.activeTab = '';

		this.panels.homeContent?.RemoveClass('mainmenu__home-container--hidden');
		this.panels.pauseContent?.RemoveClass('mainmenu__home-container--hidden');

		$.DispatchEvent('HideContentPanel');
	}

	/**
	 * Set video bg and play menu music
	 */
	static setMainMenuDetails() {
		if (!this.panels.movie?.IsValid() || !this.panels.image?.IsValid()) return;

		let useVideo = $.persistentStorage.getItem('settings.mainMenuMovie');

		if (useVideo === null) {
			// Enable video by default
			useVideo = true;
			$.persistentStorage.setItem('settings.mainMenuMovie', true);
		}

		this.panels.movie.visible = !!useVideo;
		this.panels.movie.SetReadyForDisplay(!!useVideo);

		this.panels.image.visible = !useVideo;
		this.panels.image.SetReadyForDisplay(!useVideo);

		const chapter = GameInterfaceAPI.GetSettingInt('sv_unlockedchapters');
		let act = 0;

		if (chapter === 1) act = 1;
		else if (chapter >= 2 && chapter <= 5) act = 2;
		else if (chapter >= 6 && chapter <= 7) act = 3;
		else if (chapter >= 8 && chapter <= 9) act = 4;
		else if (chapter >= 10) act = 5;
		else act = 1; // Bad unlockedchapters. Resort to act 1.

		let movie = 'file://{media}/menu_act0' + act + '.webm';
		if (this.inSpace) {
			movie = 'file://{media}/sp_a5_credits.webm';
		}

		if (useVideo) {
			this.panels.movie.SetMovie(movie);
			this.panels.movie.Play();
		} else {
			// TODO: account for 4:3 displays
			this.panels.image.SetImage('file://{materials}/vgui/backgrounds/background0' + act + '_widescreen.vtf');
		}
		
		$.PlaySoundEvent(`UIPanorama.Music.P2.MenuAct${chapter}`);
	}

	

	/**
	 * Load the latest save available.
	 */
	static loadLatestSave() {
		const saves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time);

		if (saves.length === 0) return;

		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_LoadGame_Confirm'),
				$.Localize('#Action_LoadGame_Auto_Message'),
				'warning-popup',
				$.Localize('#Action_LoadGame'),
				() => {
					SaveRestoreAPI.LoadSave(saves[0].name);
				},
				$.Localize('#Action_Return'),
				() => {},
				'blur'
			);
		} else {
			SaveRestoreAPI.LoadSave(saves[0].name);
		}
	}

	/**
	 * Handles home button getting pressed.
	 */
	static onHomeButtonPressed() {
		$<RadioButton>('#HomeButton')?.SetSelected(true);
		this.onHideContentPanel();
	}

	/**
	 * Force a button to be pressed, given its ID.
	 * The button must be of type ToggleButton.
	 * @param btnId The ID of the button to be pressed.
	 */
	static selectNavButton(btnId: string) {
		const btn = this.panels.cp.FindChildTraverse<ToggleButton>(btnId);

		if (btn) $.DispatchEvent('Activated', btn, PanelEventSource.MOUSE);
	}

	static onFeaturedFlyoutPressed() {}

	/**
	 * Handles quit button getting pressed.
	 */
	static onQuitButtonPressed() {
		this.onQuitPrompt(GameInterfaceAPI.GetGameUIState() !== GameUIState.PAUSEMENU);
	}

	/**
	 * Handles when the quit button is shown, either from button getting pressed or event fired from C++.
	 * @param {boolean} toDesktop
	 */
	static onQuitPrompt(toDesktop = true) {
		$.DispatchEvent('MainMenuPauseGame'); // make sure game is paused so we can see the popup if hit from a keybind in-game

		if (toDesktop) {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_Quit'),
				$.Localize('#Action_Quit_Message'),
				'warning-popup',
				$.Localize('#Action_Quit'),
				this.quitGame,
				$.Localize('#Action_Return'),
				() => {},
				'blur'
			);
		} else {
			UiToolkitAPI.ShowGenericPopupThreeOptionsBgStyle(
				$.Localize('#Action_Quit'),
				$.Localize('#Action_Quit_InGame_Message'),
				'warning-popup',
				$.Localize('#Action_ReturnToMenu'),
				() => {
					GameInterfaceAPI.ConsoleCommand('disconnect');
					this.onHomeButtonPressed();
				},
				$.Localize('#Action_QuitToDesktop'),
				this.quitGame,
				$.Localize('#Action_Return'),
				() => {},
				'blur'
			);
		}
	}

	/** Quits the game. Bye! */
	static quitGame() {
		GameInterfaceAPI.ConsoleCommand('quit');
	}

	/**
	 * Handles the escape key getting pressed
	 * @param {unknown} _eSource - C++ dev needs to explain what these params do. Pressing in main menu returns "MainMenuInput"
	 * @param {unknown} _nRepeats - Pressing in main menu returns "keyboard"
	 * @param {unknown} _focusPanel - Pressing in main menu returns undefined
	 */
	static onEscapeKeyPressed(_eSource, _focusPanel) {
		// Resume game in pause menu mode, OTHERWISE close the active menu menu page
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			$.DispatchEvent('MainMenuResumeGame');
		} else {
			this.onHomeButtonPressed();
		}
	}

	static onBackgroundMapLoaded(map: string, isBackgroundMap: boolean) {
		if (isBackgroundMap) {
			this.panels.movie?.Stop();
			this.panels.movie?.AddClass('mainmenu__fadeout');
		}
	}

	static onMapUnloaded() {
		if (this.panels.movie?.IsValid()) {
			this.panels.movie?.RemoveClass('mainmenu__fadeout');
			this.panels.movie?.Play();
		}

		$.PlaySoundEvent('UIPanorama.Music.StopAll');
	}

	static onLayoutReloaded() {
		this.panels.cp.SetHasClass(
			'MainMenuRootPanel--PauseMenuMode',
			GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU
		);

		this.updateHomeDetails();
	}
}
