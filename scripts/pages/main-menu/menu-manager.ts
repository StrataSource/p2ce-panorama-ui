'use strict';

class MenuPage {
	name: string;
	panel: Panel;
	headline?: string;
	tagline?: string;
	invokerPanel?: GenericPanel;

	constructor(name: string, panel: Panel) {
		this.name = name;
		this.panel = panel;
	}

	setLines(headline: string, tagline: string) {
		this.headline = headline;
		this.tagline = tagline;
	}
}

class MenuManager {
	static menuNav = $('#MenuNav')!;
	static menuBackground = $('#MenuModeBackgroundLayer')!;
	static menuForeground = $('#MenuModeForegroundLayer')!;
	static page = $<Panel>('#PageWrap')!;
	static pageBg = $<Panel>('#PageBg')!;
	static pageHeadline = $<Label>('#PageHeadline')!;
	static pageTagline = $<Label>('#PageTagline')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static pageActions = $<Panel>('#PageActions')!;
	static gradientBar = $<Panel>('#GradientBar')!;
	static controls = $<Panel>('#MenuRootControls')!;
	static logo = $<Image>('#GameFullLogo')!;
	static loadingIndicator = $<Label>('#LoadingIndicator')!;
	static menuContent = $<Panel>('#MenuMainContent')!;

	static pages: MenuPage[] = [];
	static isLoaded = false;
	static eventsRegistered = false;

	static {
		$.RegisterForUnhandledEvent('LayoutReloaded', () => {
			this.closePages();
			this.deleteMenus();
			this.isLoaded = false;
			this.onLoaded();
			$.Schedule(0.1, () => {
				$.DispatchEvent('MainMenuSwitchReverse', true);
			});
		});
	}

	static onLoaded() {
		if (this.isLoaded) return;
		this.isLoaded = true;

		if (!this.eventsRegistered) {
			// this is for campaign-menu, see there for more info
			UiToolkitAPI.GetGlobalObject()['FirstCampaignLoaded'] = false;

			$.RegisterForUnhandledEvent('MainMenuAddButton', (btn: MenuButton) => {
				if (btn.dev && !GameInterfaceAPI.GetSettingBool('developer')) {
					return;
				}

				const b = constructMenuButton(btn);
				b.SetParent(this.menuNav);
				b.SetReadyForDisplay(true);
				this.updateFocus();
			});
			$.RegisterForUnhandledEvent('MainMenuAddPreConstructedButton', (btn: GenericPanel) => {
				btn.SetParent(this.menuNav);
				btn.SetReadyForDisplay(true);
				this.updateFocus();
			});

			$.RegisterForUnhandledEvent('MainMenuAddBgPanel', (panel: Panel) => {
				panel.SetParent(this.menuBackground);
				panel.SetReadyForDisplay(true);
			});

			$.RegisterForUnhandledEvent('ShowMainMenu', () => {
				this.menuContent.AddClass('mainmenu__menu__t-prop');
				this.menuContent.RemoveClass('mainmenu__menu__anim');
				$.DispatchEvent('MainMenuSwitchFade', true, true);
				this.openMenuMode();
			});

			$.RegisterForUnhandledEvent('HideMainMenu', () => {
				// ensure that no kind of loading blur can be active when we disappear
				$.DispatchEvent('MainMenuSwitchReverse', true);
				this.closePages();
				this.deleteMenus();
				this.menuContent.RemoveClass('mainmenu__menu__t-prop');
				this.menuContent.AddClass('mainmenu__menu__anim');
			});

			$.RegisterForUnhandledEvent('ShowPauseMenu', () => {
				this.menuContent.AddClass('mainmenu__menu__t-prop');
				this.menuContent.RemoveClass('mainmenu__menu__anim');
				this.openMenuMode();
			});

			$.RegisterForUnhandledEvent('HidePauseMenu', () => {
				this.closePages();
				this.deleteMenus();
				this.menuContent.RemoveClass('mainmenu__menu__t-prop');
				this.menuContent.AddClass('mainmenu__menu__anim');
			});

			$.RegisterForUnhandledEvent('MainMenuOpenNestedPage', this.navigateToPage.bind(this));

			$.RegisterForUnhandledEvent('MainMenuSetPageLines', this.onMenuSetPageLines.bind(this));

			$.RegisterForUnhandledEvent('MainMenuCloseAllPages', this.closePages.bind(this));

			$.RegisterEventHandler('Cancelled', $.GetContextPanel(), () => {
				// Resume game in pause menu mode
				if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
					// Has to be on the root menu in order to resume
					if (this.pages.length > 0) this.navigateBack();
					else $.DispatchEvent('MainMenuResumeGame');
				} else {
					// Exit current page
					this.navigateBack();
				}
			});

			$.RegisterForUnhandledEvent('MainMenuSetLogo', (logo: string) => {
				if (logo && logo.length > 0) {
					this.logo.style.animation = 'FadeIn 0.2s ease-out 0s 1 normal forwards';
					const kfs = this.logo.CreateCopyOfCSSKeyframes('FadeIn');
					this.logo.UpdateCurrentAnimationKeyframes(kfs);
					this.logo.SetImage(logo);
				} else {
					this.logo.style.animation = 'FadeOut 0.2s ease-out 0s 1 normal forwards';
					const kfs = this.logo.CreateCopyOfCSSKeyframes('FadeOut');
					this.logo.UpdateCurrentAnimationKeyframes(kfs);
				}
			});

			$.RegisterForUnhandledEvent('MainMenuSetLogoSize', (size: string) => {
				switch (size) {
					default:
						$.Warning(`Cannot determine logo size! Was given: '${size}'`);
					// eslint-disable-next-line no-fallthrough
					case CampaignLogoSizePreset.STANDARD:
						this.logo.style.height = '130px';
						break;
				
					case CampaignLogoSizePreset.LARGE:
						this.logo.style.height = '240px';
						break;
				}
			});

			$.RegisterEventHandler('ImageFailedLoad', this.logo, () => {
				this.logo.SetImage(getRandomFallbackImage());
			});

			const registerCampaignSwitch = () => {
				$.RegisterForUnhandledEvent(
					'PanoramaComponent_Campaign_OnActiveCampaignChanged',
					(campaign: string | null) => {
						$.Msg(`MENU MANAGER: Campaign switch event recognized, changing to: ${campaign}`);
						this.closePages();
						$.DispatchEvent('MainMenuSwitchFade', false, true);
						this.deleteMenus();
						this.openMenuMode();
					}
				);
			};
			if (GameInterfaceAPI.GetSettingString('campaign_default').length === 0) {
				registerCampaignSwitch();
			} else {
				$.Schedule(0.1, () => {
					registerCampaignSwitch();
				});
			}

			MenuAnimation.init();

			this.eventsRegistered = true;
		}

		this.loadingIndicator.visible = true;
		$.DispatchEvent('MainMenuSwitchFade', true, true);

		this.openMenuMode();
	}

	static updateFocus() {
		const c = this.menuNav.Children();
		if (c.length > 0) {
			c[0].SetFocus();
		}
	}

	static deleteMenus() {
		$.DispatchEvent('MainMenuModeRequestCleanup');

		this.menuNav.RemoveAndDeleteChildren();
		this.menuBackground.RemoveAndDeleteChildren();
		this.menuForeground.RemoveAndDeleteChildren();
	}

	static openMenuMode() {
		if (this.menuForeground.GetChildCount() > 0 || this.menuBackground.GetChildCount() > 0) {
			$.Warning('MENU MANAGER: Menus are still active. Deleting them.');
			this.deleteMenus();
		}

		switch (GameInterfaceAPI.GetGameUIState()) {
			case GameUIState.MAINMENU: {
				if (!CampaignAPI.IsCampaignActive()) {
					const p = $.CreatePanel('Panel', this.menuForeground, 'MenuMode_MainMenu');
					p.LoadLayout('file://{resources}/layout/pages/main-menu/base-menu.xml', false, false);
					p.SetReadyForDisplay(true);
				} else {
					const p = $.CreatePanel('Panel', this.menuForeground, 'MenuMode_CampaignMenu');
					p.LoadLayout('file://{resources}/layout/pages/main-menu/campaign-menu.xml', false, false);
					p.SetReadyForDisplay(true);
				}
				break;
			}

			case GameUIState.PAUSEMENU: {
				const p = $.CreatePanel('Panel', this.menuForeground, 'MenuMode_PauseMenu');
				p.LoadLayout('file://{resources}/layout/pages/main-menu/pause-menu.xml', false, false);
				p.SetReadyForDisplay(true);
				break;
			}

			default:
				$.Warning("MENU MANAGER: Don't know which menu to open for this UI state! Doing nothing!");
				break;
		}
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
	static navigateToPage(tab: string, xmlName: string, invokerPanel?: GenericPanel) {
		if (
			this.pages.find((v: MenuPage) => {
				return v.name === tab;
			})
		) {
			$.Warning(`MENU MANAGER: Page '${tab}' already exists, rejecting request to open the page.`);
			return;
		}

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
		const newPage = new MenuPage(tab, newPanel);

		if (invokerPanel) {
			newPage.invokerPanel = invokerPanel;
		} else if (this.pages.length === 0) {
			for (const btn of this.menuNav.Children()) {
				if (btn.HasKeyFocus()) {
					newPage.invokerPanel = btn;
					break;
				}
			}
		}

		this.pages.push(newPage);
		newPanel.LoadLayout(`file://{resources}/layout/pages/${xmlName}.xml`, false, false);
		newPanel.RegisterForReadyEvents(true);
		newPanel.AddClass('mainmenu__page__anim');
		newPanel.SetFocus();

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
		this.controls.AddClass('mainmenu__nav__anim');
		this.page.hittest = true;
		this.page.hittestchildren = true;

		this.pageHeadline.AddClass('mainmenu__page-controls__anim');
		this.pageTagline.AddClass('mainmenu__page-controls__anim');
		this.pageActions.AddClass('mainmenu__page-controls__anim');

		this.gradientBar.AddClass('mainmenu__gradient-bar__anim');
		this.page.AddClass('mainmenu__normal-page-container');
		this.page.RemoveClass('mainmenu__wide-page-container');
		this.pageBg.style.animation = 'FadeOut 0.2s ease-out 0s 1 reverse forwards';
		this.menuForeground.style.animation = 'FadeOut 0.1s linear 0s 1 normal forwards';
	}

	// hide page container
	static hidePage() {
		this.controls.RemoveClass('mainmenu__nav__anim');
		this.pageHeadline.RemoveClass('mainmenu__page-controls__anim');
		this.pageTagline.RemoveClass('mainmenu__page-controls__anim');
		this.pageActions.RemoveClass('mainmenu__page-controls__anim');

		this.page.hittest = false;
		this.page.hittestchildren = false;
		this.gradientBar.RemoveClass('mainmenu__gradient-bar__anim');
		this.pageBg.style.animation = 'FadeOut 0.2s ease-out 0s 1 normal forwards';
		this.menuForeground.style.animation = 'FadeIn 0.25s linear 0s 1 normal forwards';
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
		let noResetFocus = false;

		if (currentPage) {
			$.DispatchEvent('MainMenuPagePreClose', currentPage.name);
			if (currentPage.name === 'Settings') $.DispatchEvent('SettingsSave');
			if (currentPage.panel.IsValid()) this.reversePageAnim(currentPage.panel);

			if (
				currentPage.invokerPanel &&
				currentPage.invokerPanel.IsValid() &&
				currentPage.invokerPanel.visible &&
				currentPage.invokerPanel.enabled
			) {
				noResetFocus = true;
				currentPage.invokerPanel.SetFocus();
				$.Msg(`MENU MANAGER: Setting focus to ${currentPage.invokerPanel.id}`);
			}
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

			if (!currentPage || !currentPage.invokerPanel) nowPage.panel.SetFocus();

			if (currentPage?.panel.IsValid()) {
				$.DispatchEvent('MainMenuPageClosed', currentPage ? currentPage.panel.id : undefined, nowPage.panel.id);
			}
		} else {
			// no more pages
			this.hidePage();
			$.DispatchEvent('MainMenuFullBackNav');

			if (!noResetFocus) $.DispatchEvent('MainMenuSetFocus');

			if (currentPage?.panel.IsValid()) {
				$.DispatchEvent('MainMenuPageClosed', currentPage ? currentPage.panel.id : undefined, undefined);
			}
		}
	}

	// pops all pages
	static closePages() {
		while (this.pages.length > 0) {
			this.navigateBack();
		}
	}

	static onMenuFocused() {
		const c = this.menuNav.Children();
		if (c.length > 0) {
			c[0].SetFocus();
		}
	}
}
