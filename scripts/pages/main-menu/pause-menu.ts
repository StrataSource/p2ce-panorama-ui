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
						$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load ${this.latestSave.fileName}`));
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			},
			hovered: () => {
				if (this.continueBtn.enabled) this.continueBox.visible = true;
			},
			unhovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
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
			additionalClasses: 'KeyboardOnly',
			focusIsHover: true
		},
		{
			id: 'SettingsControllerBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '[DEV] CONTROLLER-SPECIALIZED LAYOUT',
			activated: () => {
				$.DispatchEvent('MainMenuOpenNestedPage', 'Settings', 'settings/settings-controller', undefined);
			},
			hovered: () => {
				if (this.continueBox.IsValid()) this.continueBox.visible = false;
			},
			additionalClasses: 'ControllerOnly',
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
	static continueBtnText = $<Label>('#ContinueSaveTagline')!;
	static continueBox = $<Panel>('#ContinueBox')!;
	static continueBoxText = $<Label>('#ContinueSaveTagline')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueBtn: Button;

	static latestSave: GameSave;

	static onLoad() {
		for (const btn of this.buttons) {
			if (btn.id === 'CampaignContinueBtn') {
				this.continueBtn = constructMenuButton(btn);
				this.continueBtn.AddClass('mainmenu__nav__btn__no-gradient');

				const t = this.continueBtn.FindChildTraverse('CampaignContinueBtn_Tagline');
				if (t) this.continueBtnText = t as Label;
				else throw new Error('Cannot find Continue Button tagline!');

				$.DispatchEvent('MainMenuAddPreConstructedButton', this.continueBtn);
				continue;
			}

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

		this.setContinueDetails();
	}

	static setContinueDetails() {
		const c = CampaignAPI.GetActiveCampaign()!;

		const logo = CampaignAPI.GetCampaignMeta(`${c.bucket.id}/${c.campaign.id}`).get(CampaignMeta.FULL_LOGO);
		if (logo) {
			$.DispatchEvent('MainMenuSetLogo', `${getCampaignAssetPath(c)}${logo}`);
		} else {
			$.DispatchEvent('MainMenuSetLogo', '');
		}

		this.continueBox.visible = false;

		const saves = GameSavesAPI.GetGameSaves()
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime))
			.filter((a) => {
				return a.mapGroup === `${c.bucket.id}/${c.campaign.id}`;
			});

		this.continueBtn.enabled = false;
		this.continueBtnText.text = $.Localize('#MainMenu_SaveRestore_NoSaves');

		if (saves.length === 0) {
			$.Warning('PAUSE MENU: No saves');
			return;
		}

		// set the continue button states

		this.latestSave = saves[0];

		const savChapter = c.campaign.chapters.find((ch) => {
			return (
				ch.maps.find((map) => {
					return map.name === this.latestSave.mapName || map.name === `${this.latestSave.mapName}.bsp`;
				}) !== undefined
			);
		});

		if (!savChapter) {
			$.Warning('PAUSE MENU: Map could not be found for Campaign');
			return;
		}

		//const chapterString = `[${c.chapters.indexOf(savChapter!) + 1} / ${c.chapters.length}]`;

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		const date = new Date(Number(this.latestSave.fileTime));
		this.continueBoxText.text = convertTime(date);
		const chapterName = $.Localize(savChapter.title);
		this.continueBtnText.text = chapterName.replace('\n', ': ');

		this.continueBtn.enabled = true;
	}
}
