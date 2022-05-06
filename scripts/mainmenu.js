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

	function _onNewGameMenu() {
		_enableMainMenu(false)
		_hideElement('#NavListContainer',true);
		let content = $("#MainMenuButtonsNewGameList");
		let sidepanel = $('#MainMenuButtonsNewGamePanel');
		content.RemoveAndDeleteChildren();
		let file = $.LoadKeyValuesFile( "panorama/config/test_map_config.kv" );
		if(file != undefined){ //this happens if the file is both not present or if it's invalid KV.
			for(let [MenuIdentifier,MenuContents] of Object.entries(file)){
				let button = $.CreatePanel("Button", content, "", {class: "CampaignButtonButton ListItem MainNewGameListItem"});
				$.CreatePanel("Label",button,"", {text: MenuContents.name, class:"CampaignButtonLabel CampaignButtonLabelPrimary"});
				$.CreatePanel("Label",button,"", {text:"\nBy "+MenuContents.publisher, class:"CampaignButtonLabel CampaignButtonLabelSecondary"});
				$.CreatePanel("Image",button,"", {src:MenuContents.icon, class:"CampaignButtonImage"});
			}
		} else {
			$.CreatePanel("Label", content, "", { style:"align: center center;", text: "OOPS!" });
		}
		_hideElement("#MainMenuButtonsNewGameContent",false)
	}

	function _onHidePauseMenu() {
		$("#MainMenuContainerPanel").RemoveClass("PauseMenuFade");
		$("#BackbufferImagePanel").RemoveClass("PauseMenuVignette");

		_onHomeButtonPressed();
	}

	function _enableMainMenu(bool = true) {
		$("#MainMenuPanel").enabled = bool;
	}

	function _onHomeButtonPressed() {
		_hideAllSubMenus();
		_enableMainMenu();
		$.DispatchEvent("HideContentPanel");
	}

	// --------------------------------------------------------------------------------------------------
	// Icon buttons functions
	// --------------------------------------------------------------------------------------------------

	function _hideAllSubMenus() {
		$("#MainMenuButtonsWorkshopContent").visible = false;
		$("#MainMenuButtonsSettingsContent").visible = false;
		_hideElement("#QuitMenu",true);
		_hideElement("#MainMenuButtonsNewGameContent",true)
		// _hideElement("#QuitMenu",true);
	}

	function _onSettingsMenuButtonPressed() {
		_hideAllSubMenus();
		_enableMainMenu(false)
		$("#MainMenuButtonsSettingsContent").visible = true;
	}

	function _onWorkshopMenuButtonPressed() {
		//currently partially unused, awaiting full workshop support.
		_hideAllSubMenus();
		_enableMainMenu(false)
		$("#MainMenuButtonsWorkshopContent").visible = true;
	}

	function _playMap(map) {
		_hideAllSubMenus();
		GameInterfaceAPI.ConsoleCommand("map " + map);
	}

	function _onEscapeKeyPressed(_eSource, _nRepeats, _focusPanel) {
		// Resume game (pause menu mode)
		if (GameInterfaceAPI.GetGameUIState() == GAME_UI_STATE.PAUSEMENU) $.DispatchEvent("ChaosMainMenuResumeGame");
		_hideAllSubMenus();
		_hideElement('#NavListContainer',false);
		_enableMainMenu();
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
		$("#MainMenuButtonsSettingsProperty_MasterVolume").value = _getNumberCVar("volume");
		$("#MainMenuButtonsSettingsProperty_MusicVolume").value = _getNumberCVar("snd_volume_music");
		$("#MainMenuButtonsSettingsProperty_ThreadedAudio").checked = _getBooleanCVar("snd_hrtf_async");

		// Graphics
		$("#MainMenuButtonsSettingsProperty_VerticalSync").checked = _getBooleanCVar("mat_vsync");

		// Gameplay
		$("#MainMenuButtonsSettingsProperty_PortalOneCrosshair").checked = _getBooleanCVar("portalgun_crosshair_mode");

		// Interface
		$("#MainMenuButtonsSettingsProperty_ToggleQuakeConsole").checked = $.persistentStorage.getItem("p2ce.console.quake") ?? false;
	}

	function _onToggleCVar(cvar) {
		GameInterfaceAPI.SetSettingString(cvar, Number(!_getBooleanCVar(cvar)));
	}

	function _onToggleStoredVar(storedVar) {
		$.persistentStorage.setItem(storedVar, !($.persistentStorage.getItem(storedVar) ?? false));
	}


	function _hideElement(element, bool = true) {
		if(element != null){
			const panel = $(element);
			if(!bool){
				panel.RemoveClass("hide");
				panel.AddClass("show");
				panel.RemoveClass("MainMenuFadeDisabled");
				panel.AddClass("MainMenuFadeEnabled");
				panel.visible = true;
				_enableMainMenu(false);
			} else {
				$.Schedule(0.2, ()=>{
					panel.RemoveClass("show")
					panel.AddClass("hide")
					panel.visible = false;
				});
				_enableMainMenu(true);
				panel.RemoveClass("MainMenuFadeEnabled");
				panel.AddClass("MainMenuFadeDisabled");
				
			}	
		} else {
			$.Warn("Unable to hide element: Undefined")
		}
	}

	return {
		playMap: _playMap,
		setBackgroundMovie: _setBackgroundMovie,
		onSettingsMenuButtonPressed: _onSettingsMenuButtonPressed,
		onShowMainMenu: _onShowMainMenu,
		hideElement: _hideElement,
		onNewGameMenu: _onNewGameMenu,
		enableMainMenu: _enableMainMenu,
		onHideMainMenu: _onHideMainMenu,

		onShowPauseMenu: _onShowPauseMenu,
		onHidePauseMenu: _onHidePauseMenu,
		onWorkshopMenuButtonPressed: _onWorkshopMenuButtonPressed,
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
	MainMenuController.enableMainMenu();
	MainMenuController.hideElement('#NavListContainer',false);
	MainMenuController.hideElement('#QuitMenu',true);
	MainMenuController.initializeSettings();
})();
