"use strict";

// --------------------------------------------------------------------------------------------------
// Purpose: Main menu controller
//			NOTE: This is NOT a class because the main menu uses a global v8 context, which is never
//			cleared. This means that if you do use a class here, reloading the JS file will result
//			in v8 complaining that the class is already defined. So basically, yes, you can
//			use a class here, but ONLY if you DONT want to be able to reload JS on the main menu
// --------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-var
var MainMenuController = (function () {
	/*
	 * Can be in 5 states:
	 * -1: no menu is open
	 *  0: campaign menu is open
	 *  1: workshop menu is open
	 *  2: settings menu is open
	 *  3: quit menu is open
	 */
	let activeSubMenu = -1;

	let pauseMenuActive = false;
	let currentMenuLayout = null;

	// craftable: Currently made a variable to store this for reuse
	// When menu gets more complex, rewrite
	const presence = {
		discord: {
			state: "Idling",
			name: "P2:CE",
			details: "Main Menu",
			assets: {
				large_image: "logo_square",
				large_text: "Portal 2: Community Edition",
			},
		},
		steam: {
			// TODO...
		},
	};

	function _setBackgroundMovie(movie) {
		const videoPlayer = $("#MainMenuMovie");
		videoPlayer.SetAttributeString("data-type", "video/webm");
		videoPlayer.SetMovie("file://{media}/" + movie + ".webm");
		videoPlayer.Play();
	}

	function _setMenuRichPresence() {
		RichPresenceAPI.UpdateRichPresenceState(presence);
	}

	function _onShowMainMenu() {
		pauseMenuActive = false;
		$("#MainMenuTopBarCampaign").visible = true;
		$("#MainMenuTopBarAddons").visible = true;

		_resetAllSubMenuSvgIcons(); // HACK HACK STUPID HACK

		// Just in case these haven't been removed (should only be active in the pause menu)
		$("#MainMenuContainerPanel").RemoveClass("PauseMenuFade");
		$("#BackbufferImagePanel").RemoveClass("PauseMenuVignette");

		// Make the ambience sound on movies play
		GameInterfaceAPI.SetSettingInt("panorama_play_movie_ambient_sound", 1);

		// No menus are open yet
		_hideAllSubMenus();

		// Set convars to play main menu dsp effects. These are overridden
		// by the game engine when we enter a map.
		GameInterfaceAPI.SetSettingInt("dsp_room", 29);
		GameInterfaceAPI.SetSettingString("snd_soundmixer", "MainMenu_Mix");

		_setMenuRichPresence();

		const savedCampaignLayout = $.persistentStorage.getItem("p2ce.mainmenu.currentCampaign") ?? "p2ce";
		_displayStartupCampaign(savedCampaignLayout);
		// Do this after we know this ID is valid
		$("#MainMenuCampaignFrame").AddClass("MainMenu");
		$("#MainMenuCampaignFrame").RemoveClass("PauseMenu");

		$.DispatchEvent("P2CEShowMainMenu");
	}

	function _onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
		_hideAllSubMenus();
	}

	function _onShowPauseMenu() {
		pauseMenuActive = true;
		$("#MainMenuTopBarCampaign").visible = false;
		$("#MainMenuTopBarAddons").visible = false;

		_resetAllSubMenuSvgIcons(); // HACK HACK STUPID HACK

		$("#MainMenuContainerPanel").AddClass("PauseMenuFade");
		$("#BackbufferImagePanel").AddClass("PauseMenuVignette");

		$("#MainMenuCampaignFrame").RemoveClass("MainMenu");
		$("#MainMenuCampaignFrame").AddClass("PauseMenu");

		$.DispatchEvent("P2CEShowPauseMenu");
	}

	function _onHidePauseMenu() {
		$("#MainMenuContainerPanel").RemoveClass("PauseMenuFade");
		$("#BackbufferImagePanel").RemoveClass("PauseMenuVignette");

		_onHomeButtonPressed();
	}

	function _onHomeButtonPressed() {
		_hideAllSubMenus();
		$.DispatchEvent("HideContentPanel");
	}

	// --------------------------------------------------------------------------------------------------
	// Icon buttons functions
	// --------------------------------------------------------------------------------------------------

	function _hideAllSubMenus() {
		$("#MainMenuTopBarCampaignContent").visible = false;
		$("#MainMenuTopBarWorkshopContent").visible = false;
		$("#MainMenuTopBarSettingsContent").visible = false;
		$("#MainMenuTopBarQuitContent").visible = false;
		activeSubMenu = -1;
	}

	function _showSubMenu(menu) {
		if (menu === activeSubMenu) {
			activeSubMenu = -1;
			_hideAllSubMenus();
			return;
		}
		_hideAllSubMenus();
		switch (menu) {
			case -1:
				break;
			case 0:
				$("#MainMenuTopBarCampaignContent").visible = true;
				break;
			case 1:
				$("#MainMenuTopBarWorkshopContent").visible = true;
				break;
			case 2:
				$("#MainMenuTopBarSettingsContent").visible = true;
				break;
			case 3:
				$("#MainMenuTopBarQuitContent").visible = true;
				break;
		}
		activeSubMenu = menu;
	}

	function _resetAllSubMenuSvgIcons() {
		$("#MainMenuTopBarAddonsIcon").SetImage("file://{images}/menu/addons.svg");
		$("#MainMenuTopBarSettingsIcon").SetImage("file://{images}/icons/settings.svg");
		$("#MainMenuTopBarQuitIcon").SetImage("file://{images}/menu/quit.svg");
	}

	function _onCampaignMenuButtonPressed() {
		_showSubMenu(0);
	}

	function _onWorkshopMenuButtonPressed() {
		_showSubMenu(1);
	}

	function _onSettingsMenuButtonPressed() {
		_showSubMenu(2);
	}

	function _quitButtonPressed(pressed) {
		// this panel is special, it has two buttons affecting the future of submenu-kind
		if (pressed) {
			_quitGame();
		} else {
			$("#MainMenuTopBarQuitContent").visible = false;
			activeSubMenu = -1;
		}
	}

	function _onQuitMenuButtonPressed() {
		_showSubMenu(3);
	}

	function _quitGame() {
		GameInterfaceAPI.ConsoleCommand("quit");
	}

	function _playMap(map) {
		_hideAllSubMenus();
		GameInterfaceAPI.ConsoleCommand("map " + map);
	}

	function _onEscapeKeyPressed(_eSource, _nRepeats, _focusPanel) {
		// Resume game (pause menu mode)
		if (pauseMenuActive) $.DispatchEvent("ChaosMainMenuResumeGame");
		_hideAllSubMenus();
	}

	// --------------------------------------------------------------------------------------------------
	// Settings
	// -------------------------------------------------------------------------------------------------

	function _getBooleanCVar(cvar) {
		return GameInterfaceAPI.GetSettingBool(cvar);
	}

	function _getNumberCVar(cvar) {
		// Done this way so we don't need to have separate functions for ints and floats
		return Number(GameInterfaceAPI.GetSettingString(cvar));
	}

	function _initializeSettings() {
		// Audio
		$("#MainMenuTopBarSettingsProperty_MasterVolume").value = _getNumberCVar("volume");
		$("#MainMenuTopBarSettingsProperty_MusicVolume").value = _getNumberCVar("snd_volume_music");
		$("#MainMenuTopBarSettingsProperty_ThreadedAudio").checked = _getBooleanCVar("snd_hrtf_async");

		// Graphics
		$("#MainMenuTopBarSettingsProperty_VerticalSync").checked = _getBooleanCVar("mat_vsync");

		// Gameplay
		$("#MainMenuTopBarSettingsProperty_PortalOneCrosshair").checked = _getBooleanCVar("portalgun_crosshair_mode");

		// Interface
		$("#MainMenuTopBarSettingsProperty_ToggleQuakeConsole").checked =
			$.persistentStorage.getItem("p2ce.console.quake") ?? false;
	}

	function _onToggleCVar(cvar) {
		GameInterfaceAPI.SetSettingString(cvar, Number(!_getBooleanCVar(cvar)));
	}

	function _onToggleStoredVar(storedVar) {
		$.persistentStorage.setItem(storedVar, !($.persistentStorage.getItem(storedVar) ?? false));
	}

	function _displayStartupCampaign(layout) {
		const newMenu =
			$("#MainMenuCampaignFrame") ??
			$.CreatePanel("Frame", $("#MainMenuCampaignFrameParent"), "MainMenuCampaignFrame");

		if (currentMenuLayout !== layout) {
			newMenu.SetSource("file://{resources}/layout/pages/main-menu/" + layout + ".xml");
			$.DispatchEvent("P2CEShowMainMenu");
			currentMenuLayout = layout;

			$.persistentStorage.setItem("p2ce.mainmenu.currentCampaign", layout);

			$("#MainMenuTopBarCampaignIcon").SetImage("file://{images}/menu/" + layout + "/logo.png");
			_onEscapeKeyPressed();
		} else {
			_hideAllSubMenus();
		}
	}

	return {
		playMap: _playMap,
		setBackgroundMovie: _setBackgroundMovie,
		onCampaignMenuButtonPressed: _onCampaignMenuButtonPressed,
		onWorkshopMenuButtonPressed: _onWorkshopMenuButtonPressed,
		onSettingsMenuButtonPressed: _onSettingsMenuButtonPressed,
		onQuitMenuButtonPressed: _onQuitMenuButtonPressed,
		quitButtonPressed: _quitButtonPressed,
		onShowMainMenu: _onShowMainMenu,
		onHideMainMenu: _onHideMainMenu,
		onShowPauseMenu: _onShowPauseMenu,
		onHidePauseMenu: _onHidePauseMenu,
		onEscapeKeyPressed: _onEscapeKeyPressed,
		initializeSettings: _initializeSettings,
		toggleCVar: _onToggleCVar,
		toggleStoredVar: _onToggleStoredVar,
		displayStartupCampaign: _displayStartupCampaign,
	};
})();

// Entry point called on create
(function () {
	$.RegisterForUnhandledEvent("OpenPlayMenu", MainMenuController.onCampaignMenuButtonPressed);
	$.RegisterForUnhandledEvent("ChaosShowMainMenu", MainMenuController.onShowMainMenu);
	$.RegisterForUnhandledEvent("ChaosHideMainMenu", MainMenuController.onHideMainMenu);
	$.RegisterForUnhandledEvent("ChaosShowPauseMenu", MainMenuController.onShowPauseMenu);
	$.RegisterForUnhandledEvent("ChaosHidePauseMenu", MainMenuController.onHidePauseMenu);

	$.RegisterEventHandler("Cancelled", $.GetContextPanel(), MainMenuController.onEscapeKeyPressed);

	$.DefineEvent("P2CEShowMainMenu", 0);
	$.DefineEvent("P2CEShowPauseMenu", 0);

	$.DefineEvent("P2CEPauseMenuResume", 0);
	$.RegisterForUnhandledEvent("P2CEPauseMenuResume", MainMenuController.onEscapeKeyPressed);

	$.DefineEvent("P2CEMainMenuSetBackgroundMovie", 1);
	$.RegisterForUnhandledEvent("P2CEMainMenuSetBackgroundMovie", MainMenuController.setBackgroundMovie);

	$.DefineEvent("P2CEMainMenuPlayMap", 1);
	$.RegisterForUnhandledEvent("P2CEMainMenuPlayMap", MainMenuController.playMap);

	MainMenuController.initializeSettings();
})();
