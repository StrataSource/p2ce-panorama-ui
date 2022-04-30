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

		$.DispatchEvent("P2CEShowMainMenu");
		// Do this after we know this ID is valid
		$("#MainMenuCampaignFrame").AddClass("MainMenu");
		$("#MainMenuCampaignFrame").RemoveClass("PauseMenu");

		$.DispatchEvent("P2CEMainMenuSetBackgroundMovie", "community_bg1");
	}

	function _onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
		_hideAllSubMenus();
	}

	function _onShowPauseMenu() {

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
		$("#MainMenuTopBarWorkshopContent").visible = false;
		$("#MainMenuTopBarSettingsContent").visible = false;
		_hideQuitMenu(true);
	}

	function _onSettingsMenuButtonPressed() {
		_hideAllSubMenus();
		$("#MainMenuTopBarSettingsContent").visible = true;
	}

	function _onWorkshopMenuButtonPressed() {
		//currently unused, awaiting full workshop support.
		_hideAllSubMenus();
		$("#MainMenuTopBarWorkshopContent").visible = true;
	}

	function _playMap(map) {
		_hideAllSubMenus();
		GameInterfaceAPI.ConsoleCommand("map " + map);
	}

	function _onEscapeKeyPressed(eSource, nRepeats, focusPanel) {
		// Resume game (pause menu mode)
		if (GameInterfaceAPI.GetGameUIState()) $.DispatchEvent("ChaosMainMenuResumeGame");
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
		$("#MainMenuTopBarSettingsProperty_ToggleQuakeConsole").checked = $.persistentStorage.getItem("p2ce.console.quake") ?? false;
	}

	function _onToggleCVar(cvar) {
		GameInterfaceAPI.SetSettingString(cvar, Number(!_getBooleanCVar(cvar)));
	}

	function _onToggleStoredVar(storedVar) {
		$.persistentStorage.setItem(storedVar, !($.persistentStorage.getItem(storedVar) ?? false));
	}

	function _hideQuitMenu(bool = true) {
		const panel = $("#QuitMenu");
		if(!bool){
			panel.RemoveClass("Disabled");
			panel.AddClass("Enabled");
			panel.RemoveClass("MainMenuSubContainerDisabled");
			panel.AddClass("MainMenuSubContainerEnabled");
		} else {
			$.Schedule(0.2, ()=>panel.RemoveClass("Enabled"));
			$.Schedule(0.2, ()=>panel.AddClass("Disabled"));
			panel.RemoveClass("MainMenuSubContainerEnabled");
			panel.AddClass("MainMenuSubContainerDisabled");
		}
	}

	return {
		playMap: _playMap,
		setBackgroundMovie: _setBackgroundMovie,
		onSettingsMenuButtonPressed: _onSettingsMenuButtonPressed,
		onShowMainMenu: _onShowMainMenu,
		hideQuitMenu: _hideQuitMenu,
		onHideMainMenu: _onHideMainMenu,
		onShowPauseMenu: _onShowPauseMenu,
		onHidePauseMenu: _onHidePauseMenu,
		onEscapeKeyPressed: _onEscapeKeyPressed,
		initializeSettings: _initializeSettings,
		toggleCVar: _onToggleCVar,
		toggleStoredVar: _onToggleStoredVar,
	};
})();

// Entry point called on create
(function () {
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
