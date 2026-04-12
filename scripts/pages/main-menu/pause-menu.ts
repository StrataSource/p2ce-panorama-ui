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
			hovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
			unhovered: () => {},
			focusIsHover: true
		},
		{
			id: 'CampaignContinueBtn',
			headline: '#MainMenu_SaveRestore_LoadAuto',
			tagline: '#MainMenu_SaveRestore_LoadAuto_Tagline',
			activated: () => {
				if (!this.latestSave) return;

				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_LoadGame_Confirm'),
					$.Localize('#Action_LoadGame_Auto_Message'),
					'warning-popup',
					$.Localize('#Action_LoadGame'),
					() => {
						$.DispatchEvent('MainMenuCloseAllPages');
						$.DispatchEvent('LoadingScreenClearLastMap');
						$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load "${this.latestSave.fileName}"`));
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			},
			hovered: () => {
				if (this.continueBtnEnabled && this.continueBox.IsValid()) this.continueBox.visible = true;
			},
			unhovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
			additionalClasses: 'mainmenu__nav__btn__no-gradient',
			focusIsHover: true
		},
		{
			id: 'LoadGameBtn',
			headline: '#MainMenu_SaveRestore_Main',
			tagline: '#MainMenu_SaveRestore_Main_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'GameSaves', 'campaigns/saves-list', undefined);
			},
			hovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
			focusIsHover: true
		},
		{
			id: 'SettingsKeyboardBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '#MainMenu_Navigation_Options_Tagline',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Settings', 'settings/settings', undefined);
			},
			hovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
			focusIsHover: true
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
			hovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
			focusIsHover: true
		}
	];

	// i copied and pasted this code, sue me
	// maybe fix it up later...
	static continueBox = $<Panel>('#ContinueBox')!;
	static continueBoxText = $<Label>('#ContinueSaveTagline')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueBtnEnabled: boolean = false;
	static continueBtn: string = 'CampaignContinueBtn';

	static latestSave: GameSave;

	static onLoad() {
		for (const btn of this.buttons) {
			$.DispatchEvent('MainMenuAddButton', btn);
		}

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

		this.setContinueDetails();
	}

	static setContinueDetails() {
		if (!CampaignAPI.IsCampaignActive()) {
			this.continueBox.visible = false;
			this.continueBtnEnabled = false;
			const continueBtnText = $.Localize('#MainMenu_SaveRestore_NoSaves');

			$.DispatchEvent('MainMenuSetButtonProps', this.continueBtn, {
				taglineText: continueBtnText,
				enabled: this.continueBtnEnabled
			});

			$.DispatchEvent('MainMenuSetLogo', 'file://{images}/logo.svg');
			$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
			return;
		}

		let c = CampaignAPI.GetActiveCampaign()!;
		if (c) {
			const meta = CampaignAPI.GetCampaignMeta(null)!;
			const logo = meta.get(CampaignMeta.FULL_LOGO);
			if (logo) {
				$.DispatchEvent('MainMenuSetLogo', `${getCampaignAssetPath(c)}${logo}`);

				const s = meta.get(CampaignMeta.LOGO_HEIGHT) ?? CampaignLogoSizePreset.STANDARD;
				$.DispatchEvent('MainMenuSetLogoSize', s);
			} else if (isSingleWsCampaign(c)) {
				$.DispatchEvent('MainMenuSetLogo', 'file://{images}/campaigns/p2ce_ws/full_logo.svg');
				$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
			}
		} else {
			$.DispatchEvent('MainMenuSetLogo', '');
			$.DispatchEvent('MainMenuSetLogoSize', CampaignLogoSizePreset.STANDARD);
		}

		this.continueBox.visible = false;

		const isWsSingle = isSingleWsCampaign(c);

		const group = isWsSingle ? SpecialString.AUTO_WS : `${c.bucket.id}/${c.campaign.id}`;

		const saves = GameSavesAPI.GetGameSaves()
			.filter((a) => {
				return isWsSingle ? a.mapGroup.startsWith(group) : a.mapGroup === group;
			})
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		this.continueBtnEnabled = false;
		let continueBtnText = $.Localize('#MainMenu_SaveRestore_NoSaves');

		$.DispatchEvent('MainMenuSetButtonProps', this.continueBtn, {
			taglineText: continueBtnText,
			enabled: this.continueBtnEnabled
		});

		if (saves.length === 0) {
			$.Warning('PAUSE MENU: No saves');
			return;
		}

		// set the continue button states

		this.latestSave = saves[0];

		if (isWsSingle) {
			const realCampaign = CampaignAPI.FindCampaign(this.latestSave.mapGroup);
			if (realCampaign) {
				c = realCampaign;
			} else {
				$.Warning(`Associated campaign ID ${this.latestSave.mapGroup} could not be found`);
			}
		}

		const savChapter: ChapterInfo | undefined =
			this.latestSave.chapter < c.campaign.chapters.length
				? c.campaign.chapters[this.latestSave.chapter]
				: undefined;

		if (!savChapter) {
			$.Warning('PAUSE MENU: Map could not be found for Campaign');
			return;
		}

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		const date = new Date(Number(this.latestSave.fileTime));
		this.continueBoxText.text = convertTime(date);
		const chapterName = isWsSingle ? c.campaign.title : $.Localize(savChapter.title);
		continueBtnText = chapterName.replace('\n', ': ');

		this.continueBtnEnabled = true;

		$.DispatchEvent('MainMenuSetButtonProps', this.continueBtn, {
			taglineText: continueBtnText,
			enabled: this.continueBtnEnabled
		});
	}
}
