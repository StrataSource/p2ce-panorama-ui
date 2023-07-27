class MainMenu {
	static active: {[key: string]: Panel|null} = {
		button: null,
		content: null,
	};

	static panels = {
		header: $('#MainMenuHeader')!,
		body:   $('#MainMenuBody')!,
		cp:     $.GetContextPanel(),
		// movie:  $('#MainMenuMovie'),
		// image:  $('#MainMenuBackground'),
	};

	static {
		$.RegisterForUnhandledEvent('ChaosShowMainMenu', this.onShowMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ChaosHideMainMenu', this.onHideMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ChaosShowPauseMenu', this.onShowPauseMenu.bind(this));
		$.RegisterForUnhandledEvent('ChaosHidePauseMenu', this.onHidePauseMenu.bind(this));
		// $.RegisterForUnhandledEvent('ReloadBackground', this.setMainMenuBackground.bind(this));
		$.RegisterEventHandler('Cancelled', $.GetContextPanel(), this.onEscapeKeyPressed.bind(this));
		$.DispatchEvent('ChaosHideIntroMovie');
	}

	/**
	 * General onLoad initialisations.
	 * Fired when ChaosMainMenu fires its onload event.
	 */
	static onMainMenuLoaded() {
		if (GameInterfaceAPI.GetSettingBool('developer'))
			$('#nav-develop')?.RemoveClass('hide');
	}

	/** Fired by C++ whenever main menu is switched to. */
	static onShowMainMenu() {
		// this.panels.movie = $('#MainMenuMovie');
		// this.panels.image = $('#MainMenuBackground');
	}

	/** Fired by C++ whenever main menu is switched from. */
	static onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
	}

	/** Fired by C++ whenever pause menu (i.e. main menu when in a map) is switched to. */
	static onShowPauseMenu() {
		this.panels.cp.AddClass('paused');
	}

	/** Fired by C++ whenever pause menu is switched from. */
	static onHidePauseMenu() {
		this.panels.cp.RemoveClass('paused');

		// // Save to file whenever the settings page gets closed
		// if (this.activeTab === 'Settings') {
		// 	$.DispatchEvent('SettingsSave');
		// }
	}

	/** Fired by XML inline events: Header button press event */
	static onNavbarSelect(tab: string) {
		const tabID = 'tab-'+tab;

		if (this.active.content) {
			this.active.button!.RemoveClass('active');
			this.active.content.visible = false;
			this.active.content.SetReadyForDisplay(false);
		}

		let targetPanel = this.panels.body.FindChild(tabID);
		if (!targetPanel) {
			targetPanel = $.CreatePanel('Panel', this.panels.body, tabID);
			targetPanel.LoadLayout(`file://{resources}/layout/pages/tabs/${tab}.xml`, false, false);
			targetPanel.RegisterForReadyEvents(true);
		}

		this.active.button = this.panels.header.FindChildTraverse('nav-' + tab)!;
		this.active.button.AddClass('active');

		this.active.content = targetPanel;
		this.active.content.visible = true;
		this.active.content.SetReadyForDisplay(true);
	}

	/** Starts a prompt to quit the game. */
	static promptQuit() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			return;
		}

		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.LocalizeSafe('#Action_Quit'),
			$.LocalizeSafe('#Action_Quit_Message'),
			'warning-popup',
			$.LocalizeSafe('#Action_Quit'),
			this.quitGame,
			$.LocalizeSafe('#Action_Return'),
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
	 * @param source - C++ dev needs to explain what these params do. Pressing in main menu returns "MainMenuInput"
	 * @param repeats - Pressing in main menu returns "keyboard"
	 * @param focusPanel - Pressing in main menu returns undefined
	 */
	static onEscapeKeyPressed(source: unknown, repeats: unknown, focusPanel: unknown) {
		// Resume game in pause menu mode, OTHERWISE close the active menu menu page
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			$.DispatchEvent('ChaosMainMenuResumeGame');
		} else {
			this.promptQuit();
		}
	}
}
