"use strict";

// --------------------------------------------------------------------------------------------------
// Purpose: Main menu controller
//			NOTE: This is NOT a class because the main menu uses a global v8 context, which is never
//			cleared. This means that if you do use a class here, reloading the JS file will result
//			in v8 complaining that the class is already defined. So basically, yes, you can
//			use a class here, but ONLY if you DONT want to be able to reload JS on the main menu
// --------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
var MainMenu = {
	updateRichPresence() {
		RichPresenceAPI.UpdateRichPresenceState({
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
		});
	},

	setBackgroundMovie(movie) {
		const videoPlayer = $("#MainMenuMovie");
		videoPlayer.SetAttributeString("data-type", "video/webm");
		videoPlayer.SetMovie("file://{media}/" + movie + ".webm");
		videoPlayer.Play();
	},

	hideSubMenus() {
		const frame = $("#MainMenuSubMenuFrame");
		if (frame) {
			// using DeleteAsync because RemoveAndDeleteChildren permanently deletes frame children???
			frame.DeleteAsync(0.0);
		}
		$("#MainMenuPanel").visible = true;
	},

	showSubMenu(submenu) {
		$("#MainMenuPanel").visible = false;
		const existingFrame = $("#MainMenuSubMenuFrame");
		if (existingFrame) {
			existingFrame.DeleteAsync(0.0);
		}
		$.CreatePanel("Frame", $("#MainMenuSubMenuParent"), "MainMenuSubMenuFrame", {
			src: `file://{resources}/layout/menu/${submenu}.xml`,
		});
	},

	onShowMainMenu() {
		// Just in case these haven't been removed (should only be active in the pause menu)
		$("#MainMenuContainerPanel").RemoveClass("PauseMenuFade");
		$("#BackbufferImagePanel").RemoveClass("PauseMenuVignette");

		// Make the ambience sound on movies play
		GameInterfaceAPI.SetSettingInt("panorama_play_movie_ambient_sound", 1);

		// No menus are open yet
		MainMenu.hideSubMenus();

		// Set convars to play main menu dsp effects. These are overridden
		// by the game engine when we enter a map.
		GameInterfaceAPI.SetSettingInt("dsp_room", 29);
		GameInterfaceAPI.SetSettingString("snd_soundmixer", "MainMenu_Mix");

		MainMenu.updateRichPresence();

		// Do this after we know the id is valid
		$("#MainMenuContainerPanel").AddClass("MainMenu");
		$("#MainMenuContainerPanel").RemoveClass("PauseMenu");

		$.DispatchEvent("P2CESetMenuBackgroundMovie", "menu_act04");
	},

	onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
		MainMenu.hideSubMenus();
	},

	onShowPauseMenu() {
		$("#MainMenuContainerPanel").AddClass("PauseMenuFade");
		$("#BackbufferImagePanel").AddClass("PauseMenuVignette");

		$("#MainMenuContainerPanel").RemoveClass("MainMenu");
		$("#MainMenuContainerPanel").AddClass("PauseMenu");
	},

	onHidePauseMenu() {
		$("#MainMenuContainerPanel").RemoveClass("PauseMenuFade");
		$("#BackbufferImagePanel").RemoveClass("PauseMenuVignette");

		MainMenu.onHomeButtonPressed();
	},

	onHomeButtonPressed() {
		MainMenu.hideSubMenus();
		$.DispatchEvent("HideContentPanel");
	},

	playMap(map) {
		MainMenu.hideSubMenus();
		GameInterfaceAPI.ConsoleCommand("map " + map);
	},

	onEscapeKeyPressed(_eSource, _nRepeats, _focusPanel) {
		// Resume game (pause menu mode)
		if (GameInterfaceAPI.GetGameUIState() === GAME_UI_STATE.PAUSEMENU) $.DispatchEvent("ChaosMainMenuResumeGame");
		MainMenu.hideSubMenus();
	},
};

// Entry point called on create
(function () {
	$.RegisterForUnhandledEvent("ChaosShowMainMenu", MainMenu.onShowMainMenu);
	$.RegisterForUnhandledEvent("ChaosHideMainMenu", MainMenu.onHideMainMenu);
	$.RegisterForUnhandledEvent("ChaosShowPauseMenu", MainMenu.onShowPauseMenu);
	$.RegisterForUnhandledEvent("ChaosHidePauseMenu", MainMenu.onHidePauseMenu);

	$.RegisterEventHandler("Cancelled", $.GetContextPanel(), MainMenu.onEscapeKeyPressed);

	$.DefineEvent("P2CEPauseMenuResume", 0);
	$.RegisterForUnhandledEvent("P2CEPauseMenuResume", MainMenu.onEscapeKeyPressed);

	$.DefineEvent("P2CESetMenuBackgroundMovie", 1);
	$.RegisterForUnhandledEvent("P2CESetMenuBackgroundMovie", MainMenu.setBackgroundMovie);

	$.DefineEvent("P2CEMenuPlayMap", 1);
	$.RegisterForUnhandledEvent("P2CEMenuPlayMap", MainMenu.playMap);
})();
