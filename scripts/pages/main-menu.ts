type Active<T = Panel|null> = { button: T, content: T };

/* Sounds:
	"UI.Click"
	"UI.Unclick"
	"UI.Focus"
	"UI.Unfocus"
	"UI.Swap" */

class MainMenu {
	static addon_focused: boolean = false;

	static active: Active = {
		button: null,
		content: null,
	};

	static panels = {
		header: $('#MainMenuHeader')!,
		body:   $('#MainMenuBody')!,
		root:   $.GetContextPanel(),
		bg:		$<ModelPanel>('#BgModel')!,
	};

	static {
		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		$.RegisterForUnhandledEvent('HideMainMenu', this.onHideMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onShowPauseMenu.bind(this));
		$.RegisterForUnhandledEvent('HidePauseMenu', this.onHidePauseMenu.bind(this));
		$.RegisterEventHandler('Cancelled', $.GetContextPanel(), this.onEscapeKeyPressed.bind(this));
		$.DispatchEvent('HideIntroMovie');

		$.RegisterForUnhandledEvent('MainMenu.AddonFocused', (index) => {
			this.onNavbarSelect('addon', index, true);
			this.panels.bg.AddClass('zoom-in');
		});

		$.RegisterForUnhandledEvent('MainMenu.AddonUnfocused', () => {
			this.onNavbarSelect('dashboard', null, true);
			this.panels.bg.RemoveClass('zoom-in');
		});

		this.panels.bg.SetCameraPosition(-26, -12, 31);
		this.panels.bg.SetCameraAngles(45, 40, 35);
		this.panels.bg.SetCameraFOV(85);
	}

	/**
	 * General onLoad initialisations.
	 * Fired when ChaosMainMenu fires its onload event.
	 */
	static onMainMenuLoaded() {
		// $.PlaySoundEvent('UI.Music.Ambient1');
		this.onNavbarSelect('dashboard', null, true);

		if (GameInterfaceAPI.GetSettingBool('developer'))
			$('#nav-develop')?.RemoveClass('hide');
	}

	/** Fired by C++ whenever main menu is switched to. */
	static onShowMainMenu() {
		$.Msg('onShowMainMenu called!');
		// this.panels.movie = $('#MainMenuMovie');
		// this.panels.image = $('#MainMenuBackground');
	}

	/** Fired by C++ whenever main menu is switched from. */
	static onHideMainMenu() {
		$.Msg('onHideMainMenu called!');
		// this crashes the game :3
		// UiToolkitAPI.CloseAllVisiblePopups();
	}

	/** Fired by C++ whenever pause menu (i.e. main menu when in a map) is switched to. */
	static onShowPauseMenu() {
		this.panels.root.AddClass('paused');
	}

	/** Fired by C++ whenever pause menu is switched from. */
	static onHidePauseMenu() {
		this.panels.root.RemoveClass('paused');
	}

	/** Fired by XML inline events: Header button press event. The carryover parameter defines data to be sent to the tab post-transition. */
	static onNavbarSelect(tab: string, carryover: unknown=null, silent: boolean=false) {
		this.addon_focused = (tab === 'addon');

		const tabID = 'tab-'+tab;

		let targetPanel = this.panels.body.FindChild(tabID);
		if (!targetPanel) {
			targetPanel = $.CreatePanel('Panel', this.panels.body, tabID);
			targetPanel.LoadLayout(`file://{resources}/layout/pages/tabs/${tab}.xml`, false, false);
			targetPanel.RegisterForReadyEvents(true);
		}

		if (this.active.content === targetPanel) return;

		if (!silent) $.PlaySoundEvent('UI.Swap');
		$.DispatchEvent('MainMenu.TabSelected', tab, carryover);

		if (this.active.content) {
			this.active.button?.RemoveClass('active');
			this.active.content.visible = false;
			this.active.content.SetReadyForDisplay(false);
		}

		this.active.button = this.panels.header.FindChildTraverse('nav-' + tab);
		this.active.button?.AddClass('active');

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

		// UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
		// 	$.LocalizeSafe('#Action_Quit'),
		// 	$.LocalizeSafe('#Action_Quit_Message'),
		// 	'warning-popup',
		// 	$.LocalizeSafe('#Action_Quit'),
		// 	this.quitGame,
		// 	$.LocalizeSafe('#Action_Return'),
		// 	() => {},
		// 	'blur'
		// );
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
		if (this.addon_focused) {
			$.DispatchEvent('MainMenu.AddonUnfocused');
			$.PlaySoundEvent('UI.Unclick');
		}

		// Resume game in pause menu mode, OTHERWISE close the active menu menu page
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			$.DispatchEvent('ChaosMainMenuResumeGame');
		} else {
			this.promptQuit();
		}
	}
}
