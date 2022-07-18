'use strict';

// eslint-disable-next-line no-unused-vars
var MainMenuNewGame = {

	onNewGameMenu() {
		const content = $("#MainMenuButtonsNewGameList");
		content.RemoveAndDeleteChildren();
		const file = $.LoadKeyValuesFile( "panorama/config/test_map_config.kv" );
		if(file){ //this happens if the file is both not present or if it's invalid KV.
			for(let [_MenuIdentifier, MenuContents] of Object.entries(file)){
				const button = $.CreatePanel("RadioButton", content, "", {class: "CampaignButtonButton ListItem MainNewGameListItem", group:"RBG1"});
				button.RemoveAndDeleteChildren();
				button.SetPanelEvent("onactivate", (_id)=>{
					MainMenuNewGame.onNewgameSelected(MenuContents.maps);
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
	},

	onNewgameSelected(maps) {
		const content = $("#MainMenuButtonsNewGamePanel");
		$("#MainMenuNewGameChapterImage").SetImage("");
		$("#MainMenuNewGamePlayButton").enabled = false;
		content.RemoveAndDeleteChildren();
		for(let [_MenuIdentifier, MenuContents] of Object.entries(maps)){
			const button = $.CreatePanel("RadioButton", content, "", {group:"RBG2", class: "ListItem MainMenuChapterListItem"});
			button.RemoveAndDeleteChildren();
			button.SetPanelEvent("onactivate",(_id)=>MainMenuNewGame.onChapterSelected(MenuContents));
			$.CreatePanel("Label",button,"", {text: MenuContents.name, class:""});
		}
	},

	onChapterSelected(map) {
		const content = $("#MainMenuNewGameChapterImage");
		const playbutton = $("#MainMenuNewGamePlayButton");
		playbutton.enabled = true;
		playbutton.SetPanelEvent('onactivate', () => {
			MainMenu.playMap(map.map);
		});
		content.SetImage(map.image);
	},
};

(function() {
	MainMenuNewGame.onNewGameMenu();
})();
