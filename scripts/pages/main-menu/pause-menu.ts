'use strict';

class PauseMenu {
	static buttons: MenuButton[] = [
		{
			id: 'ResumeBtn',
			headline: '#MainMenu_Home_Resume',
			tagline: '#MainMenu_Home_Resume_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuResumeGame');
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		},
		{
			id: 'CampaignContinueBtn',
			headline: '#MainMenu_SaveRestore_LoadAuto',
			tagline: '#MainMenu_SaveRestore_LoadAuto_Tagline',
			activated: () => {},
			hovered: () => {},
			unhovered: () => {},
			focusIsHover: true
		},
		{
			id: 'LoadGameBtn',
			headline: '#MainMenu_SaveRestore_Main',
			tagline: '#MainMenu_SaveRestore_Main_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'GameSaves', 'campaigns/saves-list', undefined);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		},
		{
			id: 'SettingsBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '#MainMenu_Navigation_Options_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Settings', 'settings/settings', undefined);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		},
		{
			id: 'QuitBtn',
			headline: '#MainMenu_Navigation_QuitGame',
			tagline: '#MainMenu_Navigation_QuitGame_Tagline',
			activated: () => {
				UiToolkitAPI.ShowGenericPopupThreeOptionsBgStyle(
					$.Localize('#Action_Quit'),
					$.Localize('#Action_Quit_InGame_Message'),
					'warning-2-popup',
					$.Localize('#Action_ReturnToMenu'),
					() => {
						GameInterfaceAPI.ConsoleCommand('disconnect');
						$.DispatchEvent('MainMenuCloseAllPages');
					},
					$.Localize('#Action_QuitToDesktop'),
					() => {
						GameInterfaceAPI.ConsoleCommand('quit');
					},
					$.Localize('#Action_Return'),
					() => {},
					'blur'
				);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		}
	];

	static onLoad() {
		for (const btn of this.buttons) {
			$.DispatchEvent('MainMenuAddButton', btn);
		}

		$.DispatchEvent('MainMenuHideBackgroundMovie');
		$.DispatchEvent('MainMenuHideBackgroundImage', true);

		const p = $.CreatePanel('Panel', $.GetContextPanel(), 'MenuBackgroundLayer');
		p.SetReadyForDisplay(false);
		p.LoadLayoutSnippet('MenuBackgroundLayer');
		$.DispatchEvent('MainMenuAddBgPanel', p);
		p.FindChildTraverse('PauseMenuMainMenuBlur')!.AddClass('mainmenu__pause-blur__anim');
	}
}
