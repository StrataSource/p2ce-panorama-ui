'use strict';

class MainMenu {
	static movie = $<Movie>('#MainMenuMovie');

	// menu controls & page panels
	static page = $<Panel>('#PageWrap')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static controls = $<Panel>('#HomeControls')!;
	static gradientBar = $<Panel>('#GradientBar')!;
	static pageHeadline = $<Label>('#PageHeadline')!;
	static pageTagline = $<Label>('#PageTagline')!;

	// page vars
	static pages: GenericPanel[] = [];

	static continueBox = $<Panel>('#ContinueBox')!;

	static clearUiPayloads() {
		const len = $.persistentStorage.length;
		for (let i = 0; i < len; ++i) {
			const key = $.persistentStorage.key(i);
			if (!key || key.startsWith('ui-payload.')) continue;
			$.persistentStorage.removeItem(key);
			$.Msg(`Stale UI Payload Key removed: ${key}`);
		}
	}

	static onMainMenuLoaded() {
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

		this.hidePage();
		this.onContinueMouseOut();

		$.RegisterEventHandler('Cancelled', $.GetContextPanel(), this.onEscapeKeyPressed.bind(this));

		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		$.RegisterForUnhandledEvent('HideMainMenu', this.onHideMainMenu.bind(this));
		$.RegisterForUnhandledEvent('ShowPauseMenu', this.onShowPauseMenu.bind(this));
		$.RegisterForUnhandledEvent('HidePauseMenu', this.onHidePauseMenu.bind(this));
	
		$.RegisterForUnhandledEvent('MainMenuOpenNestedPage', this.onOpenNestedPageRequest.bind(this));
	}

	static onShowMainMenu() {

	}

	static onHideMainMenu() {
		UiToolkitAPI.CloseAllVisiblePopups();
	}

	static onShowPauseMenu() {
		$.GetContextPanel().AddClass('PauseMenuMode');
	}

	static onHidePauseMenu() {
		$.GetContextPanel().RemoveClass('PauseMenuMode');
	}

	static onOpenNestedPageRequest(locH: string, locS: string, xmlName: string, payloadKey: string, payload: JsonValue | undefined = undefined) {
		// FIXME: Don't like this one bit and susceptible to issues, revamp sometime.
		if (payload) $.persistentStorage.setItem(`ui-payload.${payloadKey}`, payload);
		this.navigateToPage(locH, locS, false, xmlName);
	}

	// open a page, handles nested pages and receives calls via events from other pages
	static navigateToPage(locH: string, locS: string, useWidePage: boolean, xmlName: string) {
		// hide the previous page
		if (this.pages.length > 0) {
			const priorPage = this.pages[this.pages.length - 1];
			if (priorPage.IsValid()) priorPage.visible = false;
		}

		// create the new page
		const newPanel = $.CreatePanel('Panel', this.pageInsert, `PageTab${this.pages.length}`);
		newPanel.LoadLayout(`file://{resources}/layout/pages/${xmlName}.xml`, false, false);
		newPanel.RegisterForReadyEvents(true);
		this.pages.push(newPanel);

		// TODO: $.Localize these when tokens come in
		this.pageHeadline.text = locH;
		this.pageTagline.text = locS;

		stripDevTagsFromLabels(newPanel);

		// hide menu elements, only done on root level
		if (this.pages.length === 1) {
			if (useWidePage) {
				this.showWidePage();
			} else {
				this.showPage();
			}
		}
	}

	// show page container
	static showPage() {
		this.page.visible = true;
		this.controls.visible = false;
		this.page.AddClass('mainmenu__normal-page-container');
		this.page.RemoveClass('mainmenu__wide-page-container');
	}

	// show page container using wide variant, hides all menu elements
	static showWidePage() {
		this.page.visible = true;
		this.controls.visible = false;
		this.gradientBar.visible = false;
		this.page.RemoveClass('mainmenu__normal-page-container');
		this.page.AddClass('mainmenu__wide-page-container');
	}

	// hide page container
	static hidePage() {
		this.pageInsert.RemoveAndDeleteChildren();

		this.page.visible = false;
		this.gradientBar.visible = this.controls.visible = true;
	}

	// pop top page, returning to main menu if applicable
	static navigateBack() {
		if (this.pages.length === 0) return;

		// delete the current page
		const currentPage = this.pages.pop();
		currentPage?.DeleteAsync(0);

		if (this.pages.length > 0) {
			// restore the lower level page
			this.pages[this.pages.length - 1].visible = true;
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
		this.continueBox.visible = false;
	}

	/**
	 * Handles the escape key getting pressed
	 * @param {unknown} _eSource - C++ dev needs to explain what these params do. Pressing in main menu returns "MainMenuInput"
	 * @param {unknown} _nRepeats - Pressing in main menu returns "keyboard"
	 * @param {unknown} _focusPanel - Pressing in main menu returns undefined
	 */
	static onEscapeKeyPressed(_eSource, _focusPanel) {
		$.Msg('Esc Pressed');
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

/*
class MainMenuREF {
	static onMainMenuLoaded() {
		// Assign a random model
		const models = [
			'models/panorama/menu/BotPoses.mdl',
			'models/panorama/menu/sp_a2_bridge_the_gap_WHEATLEY.mdl',
			'models/panorama/menu/sp_a1_wakeup_glados_MERGED.mdl',
		];
		if (this.panels.model) {
			this.panels.model.src = models[Math.floor(Math.random() * models.length)]; // Pick a random model

			this.panels.model.SetModelRotationSpeedTarget(0, this.inSpace ? 0.02 : 0.05, this.inSpace ? 0.02 : 0);
			this.panels.model.SetMouseXRotationScale(0, 1, 0); // By default mouse X will rotate the X axis, but we want it to spin Y axis
			this.panels.model.SetMouseYRotationScale(0, 0, 0); // Disable mouse Y movement rotations

			this.panels.model.LookAtModel();
			this.panels.model.SetCameraOffset(-300, 0, 0);
			this.panels.model.SetCameraFOV(35);

			this.panels.model.SetLightAmbient(0.2921, 0.327, 0.43);
			this.panels.model.SetDirectionalLightColor(1, 1.076, 1.2, 1.282);
			this.panels.model.SetDirectionalLightColor(0, 0.538, 0.6, 0.641);
			this.panels.model.SetDirectionalLightDirection(1, -50, 270, 0);
			this.panels.model.SetDirectionalLightDirection(0, -50, 135, 0);
		}

		$('#ControlsLibraryButton')?.SetHasClass('hide', !GameInterfaceAPI.GetSettingBool('developer'));

		this.setMainMenuDetails();

		this.showPrereleaseWarning();

		if (GameStateAPI.IsPlaytest()) this.showPlaytestConsentPopup();

		stripDevTagsFromLabels($.GetContextPanel());

		$.RegisterForUnhandledEvent('ShowMainMenu', this.onShowMainMenu.bind(this));
		this.onShowMainMenu();
	}

	static showPlaytestConsentPopup() {
		if (!DosaHandler.checkDosa('playtestConsent'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/playtest-consent.xml',
				'dosaKey=playtestConsent&dosaNameToken=Dosa_PlaytestConsent'
			);
	}

	static showPrereleaseWarning() {
		if (!DosaHandler.checkDosa('prereleaseAck'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/prerelease-warn-dialog.xml',
				'dosaKey=prereleaseAck&dosaNameToken=Dosa_PrereleaseAck'
			);
	}

	static setMainMenuDetails() {
		const chapter = GameInterfaceAPI.GetSettingInt('sv_unlockedchapters');
		let act = 0;

		if (chapter === 1) act = 1;
		else if (chapter >= 2 && chapter <= 5) act = 2;
		else if (chapter >= 6 && chapter <= 7) act = 3;
		else if (chapter >= 8 && chapter <= 9) act = 4;
		else if (chapter >= 10) act = 5;
		else act = 1; // Bad unlockedchapters. Resort to act 1.

		let movie = 'file://{media}/menu_act0' + act + '.webm';
		if (this.inSpace) {
			movie = 'file://{media}/sp_a5_credits.webm';
		}

		if (useVideo) {
			this.panels.movie.SetMovie(movie);
			this.panels.movie.Play();
		} else {
			// TODO: account for 4:3 displays
			this.panels.image.SetImage('file://{materials}/vgui/backgrounds/background0' + act + '_widescreen.vtf');
		}
	}

	
}
*/
