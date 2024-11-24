'use strict';

class MainMenu {
	static panels = {
		/** @type {Panel} @static */
		cp: $.GetContextPanel(),
		/** @type {Panel} @static */
		pageContent: $('#PageContent'),
		/** @type {Panel} @static */
		homeContent: $('#HomeContent'),
		/** @type {Panel} @static */
		contentBlur: $('#MainMenuContentBlur'),
		/** @type {Panel} @static */
		backgroundBlur: $('#MainMenuBackgroundBlur'),
		/** @type {Movie} @static */
		movie: null,
		/** @type {Image} @static */
		image: $('#MainMenuBackground'),
		/** @type {ModelPanel} @static */
		model: $('#MainMenuModel'),
		/** @type {Image} @static */
		mapSelectorBackground: $('#MainMenuBackgroundMapSelectorImage'),
		/** @type {Panel} @static */
		topButtons: $('#MainMenuTopButtons'),
		/** @type {RadioButton} @static */
		homeButton: $('#HomeButton')
	};

	static activeTab = '';
	static inSpace = false; // Temporary fun...

	static {
		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		$.RegisterForUnhandledEvent('HideMainMenu', this.onHideMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onShowPauseMenu.bind(this));
		$.RegisterForUnhandledEvent('HidePauseMenu', this.onHidePauseMenu.bind(this));
		$.RegisterForUnhandledEvent('ReloadBackground', this.setMainMenuBackground.bind(this));
		$.RegisterEventHandler('Cancelled', $.GetContextPanel(), this.onEscapeKeyPressed.bind(this));

		$.DispatchEvent('HideIntroMovie');
	}

	/**
	 * General onLoad initialisations.
	 * Fired when MainMenu fires its onload event.
	 */
	static onMainMenuLoaded() {
		// These aren't accessible until the page has loaded fully, find them now
		this.panels.movie = $('#MainMenuMovie');
		this.panels.model = $('#MainMenuModel');

		this.inSpace = Math.floor(Math.random() * 100) === 1; // 1% chance of being ejected

		// Assign a random model
		const models = [
			'models/npcs/turret/turret.mdl',
			'models/weapons/w_portalgun.mdl',
			'models/props/schrodinger_cube.mdl',
			'models/props/metal_box.mdl'
		];

		this.panels.model.src = models[Math.floor(Math.random() * models.length)]; // Pick a random model

		this.panels.model.SetModelRotationSpeedTarget(0, this.inSpace ? 0.02 : 0.15, this.inSpace ? 0.02 : 0);
		this.panels.model.SetMouseXRotationScale(0, 1, 0); // By default mouse X will rotate the X axis, but we want it to spin Y axis
		this.panels.model.SetMouseYRotationScale(0, 0, 0); // Disable mouse Y movement rotations

		this.panels.model.LookAtModel();
		this.panels.model.SetCameraOffset(-200, 0, 0);
		this.panels.model.SetCameraFOV(30);

		this.panels.model.SetDirectionalLightColor(0, 0.5, 0.5, 0.5);
		this.panels.model.SetDirectionalLightDirection(0, 1, 0, 0);

		if (GameInterfaceAPI.GetSettingBool('developer')) $('#ControlsLibraryButton').RemoveClass('hide');

		this.setMainMenuBackground();

	}

	/**
	 * Fired by C++ whenever main menu is switched to.
	 */
	static onShowMainMenu() {
		this.panels.movie = $('#MainMenuMovie');
		this.panels.image = $('#MainMenuBackground');

		this.setMainMenuBackground();
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
	 * Switch main menu page
	 */
	static navigateToPage(tab, xmlName, hasBlur = true) {
		this.panels.contentBlur.visible = hasBlur;

		if (this.activeTab === tab) {
			$.DispatchEvent('Activated', this.panels.homeButton, 'mouse');
			return;
		}

		// Check to see if tab to show exists.
		// If not load the xml file.
		if (!this.panels.cp.FindChildInLayoutFile(tab)) {
			const newPanel = $.CreatePanel('Panel', this.panels.pageContent, tab);

			newPanel.LoadLayout(`file://{resources}/layout/pages/${xmlName}.xml`, false, false);
			newPanel.RegisterForReadyEvents(true);

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
			// Trigger sound event for the new panel
			// if (xmlName) {
			// 	$.DispatchEvent('PlaySoundEffect', 'tab_' + xmlName.replace('/', '_'), 'MOUSE');
			// }

			// If the tab exists then hide it
			if (this.activeTab) {
				const panelToHide = this.panels.cp.FindChildInLayoutFile(this.activeTab);
				panelToHide.AddClass('mainmenu__page-container--hidden');

				$.DispatchEvent('MainMenuTabHidden', this.activeTab);
			}

			// Show selected tab
			this.activeTab = tab;
			const activePanel = this.panels.cp.FindChildInLayoutFile(tab);
			activePanel.RemoveClass('mainmenu__page-container--hidden');

			// Force a reload of any resources since we're about to display the panel
			activePanel.visible = true;
			activePanel.SetReadyForDisplay(true);
		}

		this.showContentPanel();
	}

	/**
	 * Show the main menu page container and retract the drawer.
	 */
	static showContentPanel() {
		this.panels.pageContent.RemoveClass('mainmenu__page-container--hidden');

		$.DispatchEvent('RetractDrawer');
		$.DispatchEvent('ShowContentPanel');

		this.panels.homeContent.AddClass('home--hidden');
	}

	/**
	 * Hide the main menu page container and active page, and display the home page content.
	 */
	static onHideContentPanel() {
		this.panels.pageContent.AddClass('mainmenu__page-container--hidden');

		// Uncheck the active button in the main menu navbar.
		const activeButton = this.panels.topButtons.Children().find((panel) => panel.IsSelected());
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

		this.panels.homeContent.RemoveClass('home--hidden');
	}

	/**
	 * Set the video background based on persistent storage settings
	 */
	static setMainMenuBackground() {
		if (!this.panels.movie?.IsValid() || !this.panels.image?.IsValid()) return;

		let useVideo = $.persistentStorage.getItem('settings.mainMenuMovie');

		if (useVideo === null) {
			// Enable video by default
			useVideo = true;
			$.persistentStorage.setItem('settings.mainMenuMovie', true);
		}

		this.panels.movie.visible = useVideo;
		this.panels.movie.SetReadyForDisplay(useVideo);

		this.panels.image.visible = !useVideo;
		this.panels.image.SetReadyForDisplay(!useVideo);

		let movie = 'file://{media}/community_bg1.webm';
		if (this.inSpace) {
			movie = 'file://{media}/sp_a5_credits.webm';
		}

		if (useVideo) {
			this.panels.movie.SetMovie(movie);
			this.panels.movie.Play();
		} else {
			this.panels.image.SetImage('file://{materials}/vgui/backgrounds/background01_widescreen.vtf');
		}
	}

	/**
	 * Handles home button getting pressed.
	 */
	static onHomeButtonPressed() {
		this.onHideContentPanel();
	}

	/**
	 * Handles quit button getting pressed, deciding whether to `disconnect` or `quit`
	 * based on if we're ingame or not.
	 */
	static onQuitButtonPressed() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			this.onHomeButtonPressed();
			return;
		}
		this.onQuitPrompt();
	}

	/**
	 * Handles when the quit button is shown, either from button getting pressed or event fired from C++.
	 * @param {boolean} toDesktop
	 */
	static onQuitPrompt(toDesktop = true) {
		if (!toDesktop) return; // currently don't handle disconnect prompts

		$.DispatchEvent('MainMenuPauseGame'); // make sure game is paused so we can see the popup if hit from a keybind in-game

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
	static onEscapeKeyPressed(_eSource, _nRepeats, _focusPanel) {
		// Resume game in pause menu mode, OTHERWISE close the active menu menu page
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			$.DispatchEvent('MainMenuResumeGame');
		} else {
			this.onHomeButtonPressed();
		}
	}
}
