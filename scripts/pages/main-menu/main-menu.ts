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
		pausedLoadLastSaveButton: $<Button>('#PausedLoadLastSaveButton')!,
		pausedViewSavesButton: $<Button>('#PausedViewSavesButton')!,
		mainMenuLoadLastSaveButton: $<Button>('#MainMenuLoadLastSaveButton')!,
		mainMenuSaveImage: $<Image>('#MainMenuSaveImage')!,
		mainMenuSaveSubheadingLabel: $<Label>('#MainMenuSaveSubheadingLabel')!,
		pausedSaveImage: $<Image>('#PausedSaveImage')!,
		pausedLatestSaveTime: $<Label>('#PausedLatestSaveTimeLabel')!,
		pausedSaveGameBtn: $<Button>('#PausedSaveGameButton')!
	};

	static activeTab = '';
	static inSpace = false; // Temporary fun...
	static currentMapCampaign: CampaignInfo | undefined = undefined;

	static {
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
			this.panels.model.SetCameraFOV(35);

			this.panels.model.SetLightAmbient(0.2921, 0.327, 0.43);
			this.panels.model.SetDirectionalLightColor(1, 1.076, 1.2, 1.282);
			this.panels.model.SetDirectionalLightColor(0, 0.538, 0.6, 0.641);
			this.panels.model.SetDirectionalLightDirection(1, -50, 270, 0);
			this.panels.model.SetDirectionalLightDirection(0, -50, 135, 0);
		}

		$('#ControlsLibraryButton')?.SetHasClass('hide', !GameInterfaceAPI.GetSettingBool('developer'));

		this.setMainMenuDetails();

		this.showPrereleaseWarning();

		if (GameStateAPI.IsPlaytest()) this.showPlaytestConsentPopup();

		stripDevTagsFromLabels($.GetContextPanel());

		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		this.onShowMainMenu();
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
		const campaigns = CampaignAPI.GetAllCampaigns();
		const matching = campaigns.find((campaign: CampaignInfo) => {
			return campaign.chapters.find((chapter: ChapterInfo) => {
				return chapter.maps.find((map) => {
					return map.name === GameInterfaceAPI.GetCurrentMap();
				}) !== undefined;
			}) !== undefined;
		});

		this.currentMapCampaign = matching;

		const saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));
		const campaignSaves = saves.filter((v: GameSave) => { return v.mapGroup === (matching ? matching.id : '') });

		const hasSaves = saves.length !== 0;
		const hasCampaignSaves = campaignSaves.length !== 0;

		this.panels.pausedLoadLastSaveButton.enabled = hasCampaignSaves;
		this.panels.mainMenuLoadLastSaveButton.enabled = hasSaves;

		const updateSavePanel = (saveArray, imagePanel, label) => {
			const save = saveArray[0];
			const thumb = `file://{__saves}/${save.fileName.replace('.sav', '.tga')}`;

			imagePanel.SetImage(thumb);

			const date = new Date(save.fileTime * 1000);
			const dateStr = `${save.mapName} ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
			label.text = dateStr;
		}

		if (hasSaves)
			updateSavePanel(saves, this.panels.mainMenuSaveImage, this.panels.mainMenuSaveSubheadingLabel);

		if (hasCampaignSaves)
			updateSavePanel(campaignSaves, this.panels.pausedSaveImage, this.panels.pausedLatestSaveTime);

		this.panels.pausedSaveGameBtn.ClearPanelEvent('onmouseover');
		this.panels.pausedSaveGameBtn.ClearPanelEvent('onmouseout');

		this.panels.pausedViewSavesButton.enabled = matching !== undefined && hasSaves;
		this.panels.pausedSaveGameBtn.enabled = matching !== undefined && !GameInterfaceAPI.GetSettingBool('map_wants_save_disable');

		if (GameInterfaceAPI.GetSettingBool('map_wants_save_disable')) {
			this.panels.pausedSaveGameBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					this.panels.pausedSaveGameBtn.id,
					$.Localize('#MainMenu_SaveRestore_SaveFailed_MapWantsSaveDisabled')
				);
			});
			this.panels.pausedSaveGameBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		}

		this.panels.pausedViewSavesButton.ClearPanelEvent('onmouseover');
		this.panels.pausedViewSavesButton.ClearPanelEvent('onmouseout');

		if (matching === undefined) {
			const setTooltip = (panel) => {
				panel.SetPanelEvent('onmouseover', () => {
					UiToolkitAPI.ShowTextTooltip(
						panel.id,
						$.Localize('#MainMenu_SaveRestore_SaveFailed_NotPartOfCampaign')
					);
				});
				panel.SetPanelEvent('onmouseout', () => {
					UiToolkitAPI.HideTextTooltip();
				});
			}
			setTooltip(this.panels.pausedSaveGameBtn);
			setTooltip(this.panels.pausedViewSavesButton);
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

		this.updateHomeDetails();

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
		let saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_LoadGame_Confirm'),
				$.Localize('#Action_LoadGame_Auto_Message'),
				'warning-popup',
				$.Localize('#Action_LoadGame'),
				() => {
					// filter down to current campaign
					saves = saves.filter((v: GameSave) => { return v.mapGroup === this.currentMapCampaign!.id });
					if (saves.length === 0) return;

					GameInterfaceAPI.ConsoleCommand(`load ${saves[0].fileName}`);
				},
				$.Localize('#Action_Return'),
				() => {},
				'blur'
			);
		} else {
			// absolute latest (on main menu)
			if (saves.length === 0) return;
			GameInterfaceAPI.ConsoleCommand(`load ${saves[0].fileName}`);
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
		// Resume game in pause menu mode
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			$.DispatchEvent('MainMenuResumeGame');
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

	static openSaveCampaign() {
		if (this.currentMapCampaign) {
			$.persistentStorage.setItem('campaigns.open', this.currentMapCampaign.id);
			$.persistentStorage.setItem('campaigns.showTab', 'CampaignSaveBtn');
			this.selectNavButton('PlayButton');
		}
	}

	static openLoadCampaign() {
		if (this.currentMapCampaign) {
			$.persistentStorage.setItem('campaigns.open', this.currentMapCampaign.id);
			$.persistentStorage.setItem('campaigns.showTab', 'CampaignAllSavesBtn');
			this.selectNavButton('PlayButton');
		}
	}
}
