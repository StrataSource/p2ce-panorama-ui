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

	onShowMainMenu() {
		// Just in case these haven't been removed (should only be active in the pause menu)
		$("#MainMenuContainerPanel").RemoveClass("PauseMenuFade");
		$("#BackbufferImagePanel").RemoveClass("PauseMenuVignette");

		// Make the ambience sound on movies play
		GameInterfaceAPI.SetSettingInt("panorama_play_movie_ambient_sound", 1);

		// No menus are open yet
		MainMenu.hideAllSubMenus();

		// Set convars to play main menu dsp effects. These are overridden
		// by the game engine when we enter a map.
		GameInterfaceAPI.SetSettingInt("dsp_room", 29);
		GameInterfaceAPI.SetSettingString("snd_soundmixer", "MainMenu_Mix");

		MainMenu.updateRichPresence();

		// Do this after we know this ID is valid
		$("#MainMenuContainerPanel").AddClass("MainMenu");
		$("#MainMenuContainerPanel").RemoveClass("PauseMenu");

		$.DispatchEvent("P2CESetMenuBackgroundMovie", "community_bg1");
	},

	onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
		MainMenu.hideAllSubMenus();
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

	onNewGameMenu() {
		MainMenu.hideElement("#NavListContainer",true);
		const content = $("#MainMenuButtonsNewGameList");
		content.RemoveAndDeleteChildren();
		const file = $.LoadKeyValuesFile( "panorama/config/test_map_config.kv" );
		if(file != undefined){ //this happens if the file is both not present or if it's invalid KV.
			for(let [_MenuIdentifier, MenuContents] of Object.entries(file)){
				const button = $.CreatePanel("RadioButton", content, "", {class: "CampaignButtonButton ListItem MainNewGameListItem", group:"RBG1"});
				button.RemoveAndDeleteChildren();
				button.SetPanelEvent("onactivate", (_id)=>{
					MainMenu.onNewgameSelected(MenuContents.maps)
					$("#MainMenuNewGameChapterDescriptionLabel").text = MenuContents.description;
					$("#MainMenuNewGameChapterTitleLabel").text = MenuContents.name;
					$("#MainMenuNewGameChapterTitle2Label").text = "By " + MenuContents.publisher;
					$("#MainMenuNewGameCampaignImage").SetImage(MenuContents.icon);
				});
				$.CreatePanel("Label",button,"", {text: MenuContents.name, class:"CampaignButtonLabel CampaignButtonLabelPrimary"});
				$.CreatePanel("Label",button,"", {text:"\nBy "+MenuContents.publisher, class:"CampaignButtonLabel CampaignButtonLabelSecondary"});
				$.CreatePanel("Image",button,"", {src:MenuContents.icon, class:"CampaignButtonImage"});
			}
		} else {
			//TODO: Write proper error handling for when the kv file is invalid/missing.
			$.CreatePanel("Label", content, "", { style:"align: center center;", text: "OOPS!" });
		}
		MainMenu.hideElement("#MainMenuButtonsNewGameContent",false)
	},

	onNewgameSelected(maps) {
		const content = $("#MainMenuButtonsNewGamePanel");
		$("#MainMenuNewGameChapterImage").SetImage("");
		$("#MainMenuNewGamePlayButton").enabled = false;
		content.RemoveAndDeleteChildren();
		MainMenu.hideElement("#MainNewGamePanel",false)
		for(let [_MenuIdentifier, MenuContents] of Object.entries(maps)){
			const button = $.CreatePanel("RadioButton", content, "", {group:"RBG2", class: "ListItem MainMenuChapterListItem"});
			button.RemoveAndDeleteChildren();
			button.SetPanelEvent("onactivate",(_id)=>MainMenu.onChapterSelected(MenuContents));
			$.CreatePanel("Label",button,"", {text: MenuContents.name, class:""});
		}
	},

	onChapterSelected(map) {
		const content = $("#MainMenuNewGameChapterImage");
		const playbutton = $("#MainMenuNewGamePlayButton");
		playbutton.enabled = true;
		playbutton.SetPanelEvent('onactivate', () => {
			MainMenu.playMap(map.map);
			MainMenu.hideAllSubMenus();
		});
		content.SetImage(map.image);
	},

	onHomeButtonPressed() {
		MainMenu.hideAllSubMenus();
		$.DispatchEvent("HideContentPanel");
	},

	hideAllSubMenus() {
		//at this point, this function is a general "cleanup" function to get rid of any menu states/altered elements.
		const playbutton = $("#MainMenuNewGamePlayButton");
		playbutton.enabled = false;
		playbutton.SetPanelEvent("onactivate",(_)=>{});
		$("#MainMenuNewGameChapterImage").SetImage("");
		MainMenu.hideElement("#QuitMenu",true);
		MainMenu.hideElement("#MainMenuButtonsNewGameContent",true)
		MainMenu.hideElement("#MainNewGamePanel",true)
		const panel = $("#NavListContainer");
		panel.RemoveClass("hide");
		panel.AddClass("show");
		panel.RemoveClass("MainMenuFadeDisabled");
		panel.AddClass("MainMenuFadeEnabled");
		panel.visible = true;
		//assure main menu is present.
	},

	onSettingsMenuButtonPressed() {
		MainMenu.hideAllSubMenus();
	},

	onWorkshopMenuButtonPressed() {
		MainMenu.hideAllSubMenus();
	},

	playMap(map) {
		MainMenu.hideAllSubMenus();
		GameInterfaceAPI.ConsoleCommand("map " + map);
	},

	onEscapeKeyPressed(_eSource, _nRepeats, _focusPanel) {
		// Resume game (pause menu mode)
		if (GameInterfaceAPI.GetGameUIState() === GAME_UI_STATE.PAUSEMENU)
			$.DispatchEvent("ChaosMainMenuResumeGame");
		MainMenu.hideAllSubMenus();
		MainMenu.hideElement("#NavListContainer", false);
	},

	hideElement(element, bool = true) {
		if(element){
			const panel = $(element);
			if(!bool){
				panel.RemoveClass("hide");
				panel.AddClass("show");
				panel.RemoveClass("MainMenuFadeDisabled");
				panel.AddClass("MainMenuFadeEnabled");
				panel.visible = true;
			} else {
				$.Schedule(0.2, ()=>{
					panel.RemoveClass("show")
					panel.AddClass("hide")
					panel.visible = false;
				});
				panel.RemoveClass("MainMenuFadeEnabled");
				panel.AddClass("MainMenuFadeDisabled");
			}	
		} else {
			$.Warn("Unable to hide element: Undefined")
		}
	},
};

// Entry point called on create
(function() {
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

	MainMenu.hideElement("#NavListContainer", false);
	MainMenu.hideElement("#QuitMenu", true);
})();
