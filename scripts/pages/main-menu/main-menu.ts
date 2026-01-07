'use strict';

class MenuPage {
	name: string;
	panel: Panel;
	headline?: string;
	tagline?: string;

	constructor(name: string, panel: Panel) {
		this.name = name;
		this.panel = panel;
	}

	setLines(headline: string, tagline: string) {
		this.headline = headline;
		this.tagline = tagline;
	}
}

class MainMenu {
	static movie = $<Movie>('#MainMenuMovie');

	// menu controls & page panels
	static page = $<Panel>('#PageWrap')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static controls = $<Panel>('#HomeControls')!;
	static gradientBar = $<Panel>('#GradientBar')!;
	static pageHeadline = $<Label>('#PageHeadline')!;
	static pageTagline = $<Label>('#PageTagline')!;
	static pageActions = $<Panel>('#PageActions')!;
	static pageBg = $<Panel>('#PageBg')!;

	static pauseBlur = $<Panel>('#PauseMenuMainMenuBlur')!;
	static menuContent = $<Panel>('#MenuContentRoot')!;

	static continueBox = $<Panel>('#ContinueBox')!;

	static model = $<ModelPanel>('#MainMenuModel')!;

	static loadingIndicator = $<Label>('#LoadingIndicator')!;

	static continueBtn = $<Button>('#CampaignContinueBtn')!;
	static continueText = $<Label>('#ContinueCampaignText')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueLogo = $<Image>('#ContinueSaveLogo')!;
	static continueHeadline = $<Label>('#ContinueSaveHeadline')!;
	static continueTagline = $<Label>('#ContinueSaveTagline')!;

	static devControls = $<Button>('#DevControls')!;

	static featuredBtn = $<Button>('#FeaturedBtn')!;
	static featuredImage = $<Image>('#FeaturedImage')!;
	static featuredAvatar = $<AvatarImage>('#FeaturedAvatar')!;

	static quitBtn = $<Button>('#QuitBtn')!;

	// page vars
	static pages: MenuPage[] = [];

	// sussy mode - i gotta repair this
	static inSpace = false;

	static latestSave: GameSave;

	static music;

	static onMainMenuLoaded() {
		// don't override visibility if this is true
		if (!GameInterfaceAPI.GetSettingBool('developer')) this.devControls.visible = false;

		const XUID = UserAPI.GetXUID();
		this.featuredAvatar.steamid = XUID;

		this.setMainMenuBackground();
		this.setMainMenuModelPanel();

		this.hidePage();
		this.onContinueMouseOut();

		$.RegisterEventHandler('Cancelled', $.GetContextPanel(), this.onEscapeKeyPressed.bind(this));

		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		$.RegisterForUnhandledEvent('HideMainMenu', this.onHideMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onShowPauseMenu.bind(this));
		$.RegisterForUnhandledEvent('HidePauseMenu', this.onHidePauseMenu.bind(this));
		$.RegisterForUnhandledEvent('ReloadBackground', this.reloadBackground.bind(this));
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
		$.RegisterForUnhandledEvent('MapUnloaded', this.onMapUnloaded.bind(this));

		$.RegisterForUnhandledEvent('MainMenuOpenNestedPage', this.navigateToPage.bind(this));
		$.RegisterForUnhandledEvent('MainMenuSetPageLines', this.onMenuSetPageLines.bind(this));
		$.RegisterForUnhandledEvent('MainMenuCloseAllPages', this.closePages.bind(this));
		$.RegisterForUnhandledEvent('MainMenuSetFocus', this.setFocus.bind(this));

		MainMenuCampaignMode.onMainMenuLoaded();
		stripDevTagsFromLabels($.GetContextPanel());

		this.setContinueDetails();

		this.showPrereleaseWarning();
		if (GameStateAPI.IsPlaytest()) this.showPlaytestConsentPopup();
	}

	static onBackgroundMapLoaded(map: string, isBackgroundMap: boolean) {
		// TODO: Grab active campaign from API instead of this
		if (isBackgroundMap && UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] === undefined) {
			if (this.movie) this.movie.visible = false;
		}
	}

	static onMainMenuFocused() {
		$<Button>('#PlayBtn')!.SetFocus(true);
	}

	static tryNavigateFeatured() {
		// TODO: Grab active campaign from API instead of this
		const campaign = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN];
		if (campaign === undefined) {
			this.featuredBtn.SetFocus(true);
		}
	}

	static tryNavigateUpFeatured() {
		this.quitBtn.SetFocus(true);
	}

	static tryNavigateDownFeatured() {
		$<Button>('#PlayBtn')!.SetFocus(true);
	}

	static setContinueDetails() {
		const saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));
		this.continueLogo.visible = true;
		this.continueTagline.visible = true;
		this.continueBtn.enabled = false;
		this.continueBtn.visible = false;
		this.continueText.text = $.Localize('MainMenu_SaveRestore_NoSaves');

		if (saves.length === 0) {
			$.Warning('CONTINUE: No saves');
			return;
		}

		this.latestSave = saves[0];

		const campaigns = CampaignAPI.GetAllCampaigns();
		const savCampaign = campaigns.find((v) => {
			return v.id === this.latestSave.mapGroup;
		});

		if (!savCampaign) {
			$.Warning('CONTINUE: Save exists, but the campaign it belongs to cannot be found.');
			$.Warning(`Group: ${this.latestSave.mapGroup}`);
			return;
		}

		const savChapter = savCampaign.chapters.find((ch) => {
			return (
				ch.maps.find((map) => {
					return map.name === this.latestSave.mapName || map.name === `${this.latestSave.mapName}.bsp`;
				}) !== undefined
			);
		});

		if (!savChapter) {
			$.Warning('CONTINUE: Map could not be found for Campaign');
			return;
		}

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		this.continueText.text = `${$.Localize(savCampaign.title)}`;
		this.continueHeadline.text = `${$.Localize(savChapter.title)}`;

		const date = new Date(Number(this.latestSave.fileTime) * 1000);
		this.continueTagline.text = convertTime(date);

		this.continueBtn.SetPanelEvent('onactivate', () => {
			if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_LoadGame_Confirm'),
					$.Localize('#Action_LoadGame_Auto_Message'),
					'warning-popup',
					$.Localize('#Action_LoadGame'),
					() => {
						$.DispatchEvent('SetActiveUiCampaign', savCampaign.id);
						CampaignAPI.ContinueCampaign(savCampaign.id);
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			} else {
				$.DispatchEvent('SetActiveUiCampaign', savCampaign.id);
				CampaignAPI.ContinueCampaign(savCampaign.id);
			}
		});

		this.continueBtn.enabled = true;
		this.continueBtn.visible = true;
	}

	static reloadBackground() {
		// TODO: Grab active campaign from API instead of this
		// checking if campaign is active, if so, block setting background as it's
		// done by the campaign menu instead
		if (UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] !== undefined) return;

		this.loadingIndicator.visible = true;
		GameInterfaceAPI.ConsoleCommand('disconnect');
		$.Schedule(0.001, () => {
			this.setMainMenuBackground();
			$<Image>('#GameFullLogo')!.visible = true;
			this.featuredBtn.visible = true;
			this.featuredBtn.style.animation = 'FadeOut 0.2s ease-out 0s 1 reverse forwards';
			// buh
			MainMenuCampaignMode.switchReverse();
			this.loadingIndicator.visible = false;
		});
	}

	static onMapUnloaded() {
		this.stopMusic();
	}

	static setMainMenuBackground() {
		this.movie = $<Movie>('#MainMenuMovie');

		if (this.movie) {
			this.movie.SetMovie('file://{media}/sp_credits_bg.webm');
			this.movie.Play();
			this.movie.visible = true;
		}

		const music = `UIPanorama.Music.P2CE.Menu${Math.floor(Math.random() * 2) + 1}`;
		this.music = $.PlaySoundEvent(music);
	}

	// i think we could do something cool and have campaigns specify a model?
	static setMainMenuModelPanel() {
		// Assign a random model
		const models = [
			'models/panorama/menu/BotPoses.mdl',
			'models/panorama/menu/sp_a2_bridge_the_gap_WHEATLEY.mdl',
			'models/panorama/menu/sp_a1_wakeup_glados_MERGED.mdl'
		];
		const modelRotations = [-240, -100, -180];
		const modelZTranslates = [0, 0, -30];

		if (models.length !== modelRotations.length) {
			$.Warning('main-menu: models & modelRotations array sizes mismatch');
			return;
		}

		if (this.model) {
			const index = Math.floor(Math.random() * models.length);
			this.model.src = models[index]; // Pick a random model

			this.model.SetModelRotationSpeedTarget(0, this.inSpace ? 0.02 : 0.01, this.inSpace ? 0.02 : 0);
			this.model.SetMouseXRotationScale(0, 0.5, 0);
			this.model.SetMouseYRotationScale(0, 0, 0);
			this.model.SetModelRotation(0, modelRotations[index], 0);

			this.model.LookAtModel();
			this.model.SetCameraOffset(-300, 0, modelZTranslates[index]);
			this.model.SetCameraFOV(20);

			this.model.SetLightAmbient(0.2921, 0.327, 0.43);
			this.model.SetDirectionalLightColor(1, 1.076, 1.2, 1.282);
			this.model.SetDirectionalLightColor(0, 0.538, 0.6, 0.641);
			this.model.SetDirectionalLightDirection(1, -50, 270, 0);
			this.model.SetDirectionalLightDirection(0, -50, 135, 0);
		}
	}

	static onShowMainMenu() {
		this.menuContent.RemoveClass('mainmenu__content__t-prop');
		this.menuContent.RemoveClass('mainmenu__content__anim');

		// TODO: Grab active campaign from API instead of this
		if (UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] !== undefined) return;
		this.featuredBtn.visible = false;
	}

	static onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
		this.closePages();
		// kickoff pause anim
		this.menuContent.AddClass('mainmenu__content__anim');
	}

	static pauseAnimIn() {
		this.pauseBlur.AddClass('mainmenu__pause-blur__anim');
		this.menuContent.AddClass('mainmenu__content__t-prop');
		this.menuContent.RemoveClass('mainmenu__content__anim');
	}

	// not intended to actually animate, just reset the classes
	static pauseAnimOut() {
		this.pauseBlur.RemoveClass('mainmenu__pause-blur__anim');
		this.menuContent.RemoveClass('mainmenu__content__t-prop');
		this.menuContent.AddClass('mainmenu__content__anim');
	}

	static onShowPauseMenu() {
		$.GetContextPanel().AddClass('PauseMenuMode');
		this.pauseAnimIn();

		$('#ResumeBtn')!.SetFocus(true);

		this.featuredBtn.visible = false;
	}

	static onHidePauseMenu() {
		$.GetContextPanel().RemoveClass('PauseMenuMode');
		this.pauseAnimOut();
	}

	static onMenuSetPageLines(headline: string, tagline: string) {
		this.pageHeadline.text = headline;
		this.pageTagline.text = tagline;

		if (this.pages.length > 0) {
			this.pages[this.pages.length - 1].setLines(headline, tagline);
		}
	}

	// animate a 'flash' on the page header texts
	static flashPageLines() {
		// TODO: use keyframe anims
		//const kfs = this.pageHeadline.CreateCopyOfCSSKeyframes('FadeIn');
		//this.pageHeadline.UpdateCurrentAnimationKeyframes(kfs);
		//this.pageTagline.UpdateCurrentAnimationKeyframes(kfs);

		// remove the property setting the transitions
		this.pageHeadline.RemoveClass('mainmenu__page-controls__t-prop');
		this.pageTagline.RemoveClass('mainmenu__page-controls__t-prop');
		// set the blur
		this.pageHeadline.AddClass('mainmenu__page-controls__flash');
		this.pageTagline.AddClass('mainmenu__page-controls__flash');
		// return the transition properties and remove the blur
		$.Schedule(0.001, () => {
			this.pageHeadline.AddClass('mainmenu__page-controls__t-prop');
			this.pageTagline.AddClass('mainmenu__page-controls__t-prop');
			this.pageHeadline.RemoveClass('mainmenu__page-controls__flash');
			this.pageTagline.RemoveClass('mainmenu__page-controls__flash');
		});
	}

	// open a page, handles nested pages and receives calls via events from other pages
	// note: page headline/tagline are set by the corresponding page script, not here
	static navigateToPage(tab: string, xmlName: string) {
		// hide the previous page
		if (this.pages.length > 0) {
			const priorPage = this.pages[this.pages.length - 1];
			if (priorPage.panel.IsValid()) {
				//priorPage.panel.visible = false;
				priorPage.panel.AddClass('mainmenu__page__back-anim');
			}
		}

		// create the new page
		const newPanel = $.CreatePanel('Panel', this.pageInsert, tab);
		this.pages.push(new MenuPage(tab, newPanel));
		newPanel.LoadLayout(`file://{resources}/layout/pages/${xmlName}.xml`, false, false);
		newPanel.RegisterForReadyEvents(true);
		newPanel.AddClass('mainmenu__page__anim');
		newPanel.SetFocus(true);

		stripDevTagsFromLabels(newPanel);

		// hide menu elements, only done on root level
		if (this.pages.length === 1) {
			this.showPage();
		} else {
			// 'flash' the pagelines
			this.flashPageLines();
		}
	}

	// show page container
	static showPage() {
		this.page.hittest = true;
		this.pageInsert.hittest = false;

		this.pageHeadline.AddClass('mainmenu__page-controls__anim');
		this.pageTagline.AddClass('mainmenu__page-controls__anim');
		this.pageActions.AddClass('mainmenu__page-controls__anim');

		this.controls.AddClass('mainmenu__nav__anim');
		this.gradientBar.AddClass('mainmenu__gradient-bar__anim');
		this.page.AddClass('mainmenu__normal-page-container');
		this.page.RemoveClass('mainmenu__wide-page-container');
		this.model.AddClass('hide');
		this.pageBg.style.animation = 'FadeOut 0.2s ease-out 0s 1 reverse forwards';

		// TODO: Grab active campaign from API instead of this
		if (UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] !== undefined) return;

		this.featuredBtn.style.animation = 'FadeOut 0.2s ease-out 0s 1 normal forwards';
	}

	// hide page container
	static hidePage() {
		this.pageHeadline.RemoveClass('mainmenu__page-controls__anim');
		this.pageTagline.RemoveClass('mainmenu__page-controls__anim');
		this.pageActions.RemoveClass('mainmenu__page-controls__anim');

		this.page.hittest = false;
		this.pageInsert.hittest = false;
		this.gradientBar.RemoveClass('mainmenu__gradient-bar__anim');
		this.controls.RemoveClass('mainmenu__nav__anim');
		this.model.RemoveClass('hide');
		this.pageBg.style.animation = 'FadeOut 0.2s ease-out 0s 1 normal forwards';

		// TODO: Grab active campaign from API instead of this
		if (UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] !== undefined) return;

		this.featuredBtn.style.animation = 'FadeOut 0.2s ease-out 0s 1 reverse forwards';
	}

	static reversePageAnim(panel: GenericPanel) {
		$.RegisterEventHandler('PropertyTransitionEnd', panel, (panelName, propertyName) => {
			if (panel.id === panelName && propertyName === 'transform') {
				if (panel.IsTransparent()) {
					panel.DeleteAsync(0);
				}
			}
		});
		panel.RemoveClass('mainmenu__page__anim');
	}

	// pop top page, returning to main menu if applicable
	static navigateBack() {
		if (this.pages.length === 0) return;

		// delete the current page
		const currentPage = this.pages.pop();

		if (currentPage) {
			$.DispatchEvent('MainMenuPagePreClose', currentPage.name);
			if (currentPage.name === 'Settings') $.DispatchEvent('SettingsSave');
			if (currentPage.panel.IsValid()) this.reversePageAnim(currentPage.panel);
		}

		if (this.pages.length > 0) {
			const nowPage = this.pages[this.pages.length - 1];

			if (!nowPage.panel.IsValid()) return;

			// set directly to avoid placing the lines back haha
			if (nowPage?.headline && nowPage?.tagline) {
				this.pageHeadline.text = nowPage.headline;
				this.pageTagline.text = nowPage.tagline;
			}

			// restore the lower level page
			nowPage.panel.RemoveClass('mainmenu__page__back-anim');
			this.flashPageLines();
		} else {
			// no more pages
			this.hidePage();
			$.DispatchEvent('MainMenuFullBackNav');
		}

		$.DispatchEvent('MainMenuSetFocus');
	}

	// pops all pages
	static closePages() {
		while (this.pages.length > 0) {
			this.navigateBack();
		}
	}

	static setFocus() {
		// force focus back so that spamming ESC is possible
		// TODO: probably handle this different for controllers...
		$.GetContextPanel().SetFocus(true);
	}

	static onContinueMouseOver() {
		if (this.continueBtn.enabled) this.continueBox.visible = true;
	}

	static onContinueMouseOut() {
		if (this.continueBox.IsValid()) this.continueBox.visible = false;
	}

	/**
	 * Handles the escape key getting pressed
	 * @param {unknown} _eSource - C++ dev needs to explain what these params do. Pressing in main menu returns "MainMenuInput"
	 * @param {unknown} _nRepeats - Pressing in main menu returns "keyboard"
	 * @param {unknown} _focusPanel - Pressing in main menu returns undefined
	 */
	static onEscapeKeyPressed(_eSource, _focusPanel) {
		// Resume game in pause menu mode
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			// Has to be on the root menu in order to resume
			if (this.pages.length > 0) this.navigateBack();
			else $.DispatchEvent('MainMenuResumeGame');
		} else {
			// Exit current page
			this.navigateBack();
		}
	}

	static onQuitButtonPressed() {
		this.onQuitPrompt(GameInterfaceAPI.GetGameUIState() !== GameUIState.PAUSEMENU);
	}

	static onQuitPrompt(toDesktop = true) {
		// make sure game is paused so we can see the popup if hit from a keybind in-game
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) $.DispatchEvent('MainMenuPauseGame');

		if (toDesktop) {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_Quit'),
				$.Localize('#Action_Quit_Message'),
				'warning-popup',
				$.Localize('#Action_Quit'),
				this.quitGame,
				$.Localize('#Action_Return'),
				() => {},
				'blur'
			);
		} else {
			UiToolkitAPI.ShowGenericPopupThreeOptionsBgStyle(
				$.Localize('#Action_Quit'),
				$.Localize('#Action_Quit_InGame_Message'),
				'warning-2-popup',
				$.Localize('#Action_ReturnToMenu'),
				() => {
					GameInterfaceAPI.ConsoleCommand('disconnect');
					this.closePages();
				},
				$.Localize('#Action_QuitToDesktop'),
				this.quitGame,
				$.Localize('#Action_Return'),
				() => {},
				'blur'
			);
		}
	}

	static quitGame() {
		GameInterfaceAPI.ConsoleCommand('quit');
	}

	static stopMusic() {
		if (this.music) $.StopSoundEvent(this.music);
		this.music = undefined;
	}

	/**
	 * Shows playtest consent form
	 */
	static showPlaytestConsentPopup() {
		if (!DosaHandler.checkDosa('playtestConsent'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/playtest-consent.xml',
				'dosaKey=playtestConsent&dosaNameToken=Dosa_PlaytestConsent'
			);
	}

	/**
	 * Shows prerelease notice form
	 */
	static showPrereleaseWarning() {
		if (!DosaHandler.checkDosa('prereleaseAck'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/prerelease-warn-dialog.xml',
				'dosaKey=prereleaseAck&dosaNameToken=Dosa_PrereleaseAck'
			);
	}
}
