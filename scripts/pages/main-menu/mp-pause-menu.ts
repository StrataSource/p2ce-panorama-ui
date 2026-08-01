'use strict';

class MultiPauseMenu {
	static buttons: MenuButton[] = [
		{
			id: 'ResumeBtn',
			headline: '[HC] Close Menu',
			tagline: '[HC] Return to the game',
			activated: () => {
				$.DispatchEvent('MainMenuResumeGame');
			},
			hovered: () => {},
			unhovered: () => {},
			focusIsHover: true
		},
		{
			id: 'AddonsBtn',
			headline: '#MainMenu_Navigation_Addons',
			tagline: '#MainMenu_Navigation_Addons_Tagline_IG',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Content', 'main-menu/addons', undefined);
			},
			hovered: () => {}
		},
		{
			id: 'SettingsKeyboardBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '#MainMenu_Navigation_Options_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Settings', 'main-menu/settings/settings', undefined);
			},
			hovered: () => {},
			focusIsHover: true
		},
		{
			id: 'QuitBtn',
			headline: '[HC] Return to Lobby',
			tagline: '[HC] Quit and return to the lobby',
			activated: () => {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('[HC] Return to Lobby?'),
					$.Localize('[HC] Are you sure you want to send the game back to the lobby?'),
					'warning-popup',
					$.Localize('[HC] Return to Lobby'),
					() => {
						GameInterfaceAPI.ConsoleCommand('disconnect');
						$.DispatchEvent('MainMenuCloseAllPages');
					},
					$.Localize('#Common_Cancel'),
					() => {},
					'blur'
				);
			},
			hovered: () => {},
			focusIsHover: true
		}
	];

	static onLoad() {
		const c = CampaignAPI.GetActiveCampaign();
		for (const btn of this.buttons) {
			if (btn.id === 'QueueBtn') {
				if (!c || !c.bucket.id.startsWith('auto_')) {
					continue;
				}
			}
			$.DispatchEvent('MainMenuAddButton', btn);
		}

		// style doesnt update when the focus is set from the above event
		// so adding another event to just do it again because THE GAME HATES ME!!!!!!!
		$.DispatchEvent('MainMenuFirstButtonFocus');

		$.DispatchEvent('MainMenuHideBackgroundMovie');
		$.DispatchEvent('MainMenuHideBackgroundImage', true);
		$.DispatchEvent('MainMenuSwitchReverse', true);

		const p = $.CreatePanel('Panel', $.GetContextPanel(), 'MenuBackgroundLayer');
		p.SetReadyForDisplay(false);
		p.LoadLayoutSnippet('MenuBackgroundLayer');
		$.DispatchEvent('MainMenuAddBgPanel', p);
		p.FindChildTraverse('PauseMenuMainMenuBlur')!.AddClass('mainmenu__pause-blur__anim');

		$.RegisterForUnhandledEvent('MainMenuSetPauseBlur', (doBlur: boolean) => {
			if (doBlur) {
				p.FindChildTraverse('PauseMenuMainMenuBlur')!.AddClass('mainmenu__pause-blur__anim');
			} else {
				p.FindChildTraverse('PauseMenuMainMenuBlur')!.RemoveClass('mainmenu__pause-blur__anim');
			}
		});

		this.setLogo();
	}

	static setLogo() {
		const c = CampaignAPI.GetActiveCampaign();
		if (c) {
			const meta = CampaignAPI.GetCampaignMeta(null)!;
			const logo = meta.get(CampaignMeta.FULL_LOGO);
			if (logo) {
				$.DispatchEvent('MainMenuSetLogo', `${getCampaignAssetPath(c)}${logo}`);

				const s = meta.get(CampaignMeta.LOGO_HEIGHT) ?? CampaignLogoSizePreset.STANDARD;
				$.DispatchEvent('MainMenuSetLogoSize', s);
			} else if (isSingleWsCampaign(c)) {
				$.DispatchEvent('MainMenuSetLogo', 'file://{images}/logo.svg');
				$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
			}
		} else {
			$.DispatchEvent('MainMenuSetLogo', 'file://{images}/logo.svg');
			$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
		}
	}
}
