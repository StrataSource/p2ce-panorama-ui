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

	static pauseBlur = $<Panel>('#PauseMenuMainMenuBlur')!;
	static menuContent = $<Panel>('#MenuContentRoot')!;

	static continueBox = $<Panel>('#ContinueBox')!;

	static model = $<ModelPanel>('#MainMenuModel')!;

	// page vars
	static pages: MenuPage[] = [];

	// sussy mode - i gotta repair this
	static inSpace = false;

	static onMainMenuLoaded() {
		this.setMainMenuBackground();
		this.setMainMenuModelPanel();

		this.hidePage();
		this.onContinueMouseOut();

		$.RegisterEventHandler('Cancelled', $.GetContextPanel(), this.onEscapeKeyPressed.bind(this));

		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		$.RegisterForUnhandledEvent('HideMainMenu', this.onHideMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onShowPauseMenu.bind(this));
		$.RegisterForUnhandledEvent('HidePauseMenu', this.onHidePauseMenu.bind(this));
	
		$.RegisterForUnhandledEvent('MainMenuOpenNestedPage', this.navigateToPage.bind(this));
		$.RegisterForUnhandledEvent('MainMenuSetPageLines', this.onMenuSetPageLines.bind(this));
		$.RegisterForUnhandledEvent('MainMenuCloseAllPages', this.closePages.bind(this));

		MainMenuCampaignMode.onMainMenuLoaded();
		stripDevTagsFromLabels($.GetContextPanel());
	}

	static setMainMenuBackground() {
		this.movie = $<Movie>('#MainMenuMovie');

		const chapter = GameInterfaceAPI.GetSettingInt('sv_unlockedchapters');
		let act = 0;

		if (chapter === 1) act = 1;
		else if (chapter >= 2 && chapter <= 5) act = 2;
		else if (chapter >= 6 && chapter <= 7) act = 3;
		else if (chapter >= 8 && chapter <= 9) act = 4;
		else if (chapter >= 10) act = 5;
		else act = 1; // Bad unlockedchapters. Resort to act 1.

		const movie = 'file://{media}/menu_act0' + act + '.webm';

		if (this.movie) {
			this.movie.SetMovie(movie);
			this.movie.Play();
		}
	}

	// i think we could do something cool and have campaigns specify a model?
	static setMainMenuModelPanel() {
		// Assign a random model
		const models = [
			'models/panorama/menu/BotPoses.mdl',
			'models/panorama/menu/sp_a2_bridge_the_gap_WHEATLEY.mdl',
			'models/panorama/menu/sp_a1_wakeup_glados_MERGED.mdl',
		];
		const modelRotations = [
			-240,
			-100,
			-180
		];

		if (models.length !== modelRotations.length) {
			$.Warning('main-menu: models & modelRotations array sizes mismatch');
			return;
		}

		if (this.model) {
			const index = 0; // = Math.floor(Math.random() * models.length);
			this.model.src = models[index]; // Pick a random model

			//this.model.SetModelRotationSpeedTarget(0, this.inSpace ? 0.02 : 0.05, this.inSpace ? 0.02 : 0);
			this.model.SetMouseXRotationScale(0, 0, 0);
			this.model.SetMouseYRotationScale(0, 0, 0);
			this.model.SetModelRotation(0, modelRotations[index], 0);

			this.model.LookAtModel();
			this.model.SetCameraOffset(-300, 0, 0);
			this.model.SetCameraFOV(65);

			this.model.SetLightAmbient(0.2921, 0.327, 0.43);
			this.model.SetDirectionalLightColor(1, 1.076, 1.2, 1.282);
			this.model.SetDirectionalLightColor(0, 0.538, 0.6, 0.641);
			this.model.SetDirectionalLightDirection(1, -50, 270, 0);
			this.model.SetDirectionalLightDirection(0, -50, 135, 0);
		}
	}

	static onShowMainMenu() {
		this.setMainMenuBackground();
		this.menuContent.RemoveClass('mainmenu__content__t-prop');
		this.menuContent.RemoveClass('mainmenu__content__anim');
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
	}

	static onHidePauseMenu() {
		$.GetContextPanel().RemoveClass('PauseMenuMode');
		this.closePages();
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
		const newPanel = $.CreatePanel('Panel', this.pageInsert, `PageTab${this.pages.length}`);
		this.pages.push(new MenuPage(tab, newPanel));
		newPanel.LoadLayout(`file://{resources}/layout/pages/${xmlName}.xml`, false, false);
		newPanel.RegisterForReadyEvents(true);
		newPanel.AddClass('mainmenu__page__anim');

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
			if (currentPage.name === 'Settings')
				$.DispatchEvent('SettingsSave');

			if (currentPage.panel.IsValid())
				this.reversePageAnim(currentPage.panel);
		}

		if (this.pages.length > 0) {
			const nowPage = this.pages[this.pages.length - 1];

			// set directly to avoid placing the lines back haha
			if (nowPage?.headline && nowPage?.tagline) {
				this.pageHeadline.text = nowPage.headline;
				this.pageTagline.text = nowPage.tagline;
			}
			
			// restore the lower level page
			nowPage.panel.RemoveClass('mainmenu__page__back-anim');
			this.flashPageLines();

			// force focus back so that spamming ESC is possible
			// TODO: probably handle this different for controllers...
			$.GetContextPanel().SetFocus(true);
		} else {
			// no more pages
			this.hidePage();
		}
	}

	// pops all pages
	static closePages() {
		while (this.pages.length > 0) {
			this.navigateBack();
		}
	}

	static onContinueMouseOver() {
		this.continueBox.visible = true;
	}

	static onContinueMouseOut() {
		if (this.continueBox.IsValid())
			this.continueBox.visible = false;
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
		$.DispatchEvent('MainMenuPauseGame'); // make sure game is paused so we can see the popup if hit from a keybind in-game

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
				'warning-popup',
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
}
