'use strict';

class MainMenuSettings {
	static activeTab: string | null = null;
	static prevTab: string | null = null;

	static panels = {
		content: $<Panel>('#SettingsContent')!,
		nav: $<Panel>('#SettingsNav')!,
		navWrap: $<Panel>('#SettingsNavInner')!,
		subNav: $<Panel>('#SettingsSubNav')!,
		navExpand: $<Image>('#SettingsNavCollapseIcon')!,
		navCollapse: $<Image>('#SettingsNavExpandIcon')!,
		info: $<Panel>('#SettingsInfo')!,
		infoTitle: $<Label>('#SettingsInfoTitle')!,
		infoMessage: $<Label>('#SettingsInfoMessage')!,
		infoConvar: $<Label>('#SettingsInfoConvar')!,
		infoDocsButton: $<Button>('#SettingsInfoDocsButton')!,
		searchBar: $<TextEntry>('#SettingsSearchTextEntry')!
	};

	static tabs = {
		InputSettings: {
			xml: 'input'
		},
		AudioSettings: {
			xml: 'audio'
		},
		VideoSettings: {
			xml: 'video'
		},
		InterfaceSettings: {
			xml: 'interface'
		},
		CustomizationSettings: {
			xml: 'customization'
		},
		SearchSettings: {
			xml: 'search'
		}
	};

	static subNavRadios: Map<string, RadioButton> = new Map();
	static currentInfo = null;
	static spacerHeight: number | null = null;
	static shouldLimitScroll = false;
	static doingGameFade = false;

	static {
		// Load every tab immediately, otherwise search won't be guaranteed to find everything.
		for (const tab of Object.keys(this.tabs)) this.loadTab(tab);

		// Default to input settings page
		this.navigateToTab('InputSettings');

		// Set up event listeners
		// Switch to a settings panel - search uses this
		$.RegisterForUnhandledEvent('SettingsNavigateToPanel', this.navigateToSettingPanel.bind(this));

		// Save to file whenever the settings page gets closed
		//$.RegisterForUnhandledEvent('MainMenuTabHidden', (tab) => tab === 'Settings' && this.saveSettings());

		// Handle the settings save event
		$.RegisterForUnhandledEvent('SettingsSave', this.saveSettings.bind(this));

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Options'),
			$.Localize('#MainMenu_Navigation_Options_Tagline')
		);

		// Still faded out when we leave? Undo it
		$.RegisterForUnhandledEvent('MainMenuPagePreClose', () => {
			if (this.doingGameFade) {
				$.DispatchEvent('MainMenuSetPauseBlur', true);
			}
		});
	}

	static createSubNavBar(tab: string, pagePanel: GenericPanel) {
		this.panels.subNav.RemoveAndDeleteChildren();
		this.subNavRadios.clear();

		const groups = pagePanel.FindChildrenWithClassTraverse<Panel>('settings-group');
		const headers = pagePanel.FindChildrenWithClassTraverse<Label>('settings-group__title');

		if (groups.length !== headers.length) {
			$.Warning('Mismatched amount of Groups and Headers');
			return;
		}

		let didSelect = false;
		for (let i = 0; i < headers.length; ++i) {
			const group = groups[i];
			const header = headers[i];

			if (!group.visible) {
				continue;
			}

			if (header.text.length === 0) {
				$.Warning(`${group.id} empty`);
				continue;
			}

			const p = $.CreatePanel('RadioButton', this.panels.subNav, `${group.id}Radio`);
			p.LoadLayoutSnippet('SubNavEntry');
			p.SetDialogVariable('Text', header.text);
			p.SetPanelEvent('onactivate', () => this.navigateToSubsection(tab, group.id));

			this.subNavRadios.set(group.id, p);

			if (i + 1 < headers.length && groups[i + 1].visible)
				$.CreatePanel('Panel', this.panels.subNav, `${header.id}Div`, { class: 'settings-nav__separator' });

			if (!didSelect) {
				didSelect = true;
				p.SetSelected(true);
			}
		}
	}

	static navigateToTab(tab) {
		// If a we have a active tab and it is different from the selected tab hide it, then show the selected tab
		if (this.activeTab !== tab) {
			// If the tab exists then hide it
			if (this.activeTab) {
				// Hide the active tab
				const tab = $.GetContextPanel().FindChildInLayoutFile(this.activeTab);
				tab?.RemoveClass('settings-page--active');
			}

			// deselect radios
			for (const child of this.panels.navWrap.Children()) {
				if (child.paneltype === 'RadioButton') {
					child.SetSelected(false);
				}
			}

			// Show selected tab, store previous
			this.prevTab = this.activeTab;
			this.activeTab = tab;

			// Activate the tab
			const activePanel = $.GetContextPanel().FindChildInLayoutFile(tab)!;
			if (activePanel) {
				activePanel.AddClass('settings-page--active');
				// Force a reload of any resources since we're about to display the panel
				activePanel.visible = true;
				activePanel.SetReadyForDisplay(true);
			}

			this.createSubNavBar(this.activeTab!, activePanel);

			// Hide the info panel if it was displaying something on the previous page
			this.hideInfo();

			if (tab !== 'SearchSettings') {
				this.panels.navWrap.enabled = true;

				// Call onPageScrolled to set the checked nav subsection to the page's scroll position
				if (activePanel) this.onPageScrolled(tab, activePanel.FindChildTraverse('SettingsPageContainer'));

				// Check the radiobutton for cases where this is called from JS. CSGO Panorama fires an Activated event to the radiobutton instead but I hate that.
				const tabid = this.tabs[tab];
				if (tabid) {
					const radio = $.GetContextPanel().FindChildTraverse(`${tab}Radio`);
					if (radio) radio.checked = true;
				}
			} else {
				this.panels.navWrap.enabled = false;
			}

			SettingsShared.onChangedTab(this.activeTab);
		}
	}

	static loadTab(tab) {
		const newPanel = $.CreatePanel('Panel', this.panels.content, tab);

		// Load XML file for the page
		newPanel.LoadLayout('file://{resources}/layout/pages/settings/' + this.tabs[tab].xml + '.xml', false, false);

		// Setup all the events for all the children
		this.initPanelsRecursive(newPanel);

		const container = newPanel.FindChildTraverse('SettingsPageContainer');

		// Register the page scroll event with onPageScrolled
		if (tab !== 'SearchSettings') {
			$.RegisterEventHandler(
				'Scroll',
				container!,
				// The default arg that gets passed here is the panel's ID, override with the panel itself so we don't have to do a traversal find later on
				() => this.onPageScrolled(tab, container)
			);
		}

		// Handler that catches OnPropertyTransitionEndEvent event for this panel and closes it
		// This ensures the panel is unloaded when it's done animating
		$.RegisterEventHandler('PropertyTransitionEnd', newPanel, (panelName, propertyName) => {
			// Only handle the opacity transition
			if (
				newPanel.id === panelName &&
				propertyName === 'opacity' && // Panel is visible and fully transparent
				newPanel.visible === true &&
				newPanel.IsTransparent()
			) {
				// Set visibility to false and unload resources
				newPanel.visible = false;
				newPanel.SetReadyForDisplay(false);
				return true;
			}
			return false;
		});

		// Start the new panel off as invisible
		newPanel.visible = false;
	}

	static navigateToSubsection(tab, section) {
		// Just find the section panel,then use navigateToSettingPanel
		this.navigateToSettingPanel(tab, $.GetContextPanel().FindChildTraverse(section));
	}

	static navigateToSettingPanel(tab, panel) {
		// Switch to the page containing the setting
		if (tab !== this.activeTab) {
			this.navigateToTab(tab);
		}

		// Scroll to the location of the setting
		panel.ScrollParentToMakePanelFit(1, false);

		// Don't run the scroll position detection until scrolling has definitely finished - there may be an event for this...
		this.limitScrollCheck(1);

		// Apply highlight anim
		panel.AddClass('settings-group--highlight');

		// I really hate this way of animating, but it ensures the --highlight class gets removed
		const kfs = panel.CreateCopyOfCSSKeyframes('SettingsGroupHighlight');
		panel.UpdateCurrentAnimationKeyframes(kfs);
	}

	// Set the shouldLimitScroll bool for a specific amount of time
	static limitScrollCheck(duration) {
		this.shouldLimitScroll = true;
		$.Schedule(duration, () => (this.shouldLimitScroll = false));
	}

	static onPageScrolled(tab, panel) {
		// Panorama can fire this event A LOT, so we throttle it
		if (this.shouldLimitScroll) {
			return;
		} else {
			// Don't run again for 0.05 seconds
			this.limitScrollCheck(0.05);
		}

		if (!panel) return;

		// This is 0 on initial load for some reason
		if (this.spacerHeight && this.spacerHeight > 0) {
			this.spacerHeight =
				$.GetContextPanel().FindChildrenWithClassTraverse('settings-page__spacer')[0].actuallayoutheight;
		}

		// Calculate proportion of the way scrolled down the page
		const scrollOffset = -panel.scrolloffset_y; // scrolloffset_y is always negative
		const containerHeight = panel.contentheight;
		const containerScreenHeight = panel.actuallayoutheight;
		const proportionScrolled = scrollOffset / (containerHeight - containerScreenHeight);

		// Loop through each group until we find the one that scroll proportion fits within. If scrollOffset is 0 break in the first case
		// Think of it of partitioning [0, 1] into sections based on each section's height and seeing which partition bounds the scroll proportion
		for (const child of panel.FindChildrenWithClassTraverse('settings-group')) {
			if (
				(child.actualyoffset / containerHeight <= proportionScrolled &&
					proportionScrolled <=
						(child.actualyoffset + child.actuallayoutheight + this.spacerHeight) / containerHeight) ||
				scrollOffset === 0
			) {
				const navChild = this.subNavRadios.get(child.id);
				if (navChild) {
					navChild.SetSelected(true);
				}
				break;
			}
		}
	}

	static initPanelForPersistentVariable(panel) {
		// Initialise all the settings using persistent storage
		// Only Enum and EnumDropDown are currently supported, others can be added when/if needed
		const psVar = panel.GetAttributeString('psvar', '');
		if (psVar) {
			if (panel.paneltype === 'SettingsEnum') {
				this.initPersistentStorageEnum(panel, psVar);
			} else if (panel.paneltype === 'SettingsEnumDropDown') {
				this.initPersistentStorageEnumDropdown(panel, psVar);
			}
		}
	}

	static initPanelForGameShow(panel: GenericPanel) {
		if (GameInterfaceAPI.GetGameUIState() !== GameUIState.PAUSEMENU) return;

		const showGameVar = panel.GetAttributeString('viewgameduringedit', '');
		if (!showGameVar) return;

		if (panel.paneltype !== 'SettingsSlider') {
			$.Warning(
				`Setting field has "viewgameduringedit" attribute, but that cannot be used on this (${panel.paneltype}) panel!`
			);
			return;
		}

		const realSlider = panel.FindChildTraverse<Slider>('Slider')!;

		realSlider.SetPanelEvent('onvaluechanged', () => {
			if (this.doingGameFade) return;

			const parent = panel.GetParent();

			if (!parent) return;
			if (!this.activeTab) return;

			const page = this.panels.content.FindChildTraverse(this.activeTab);
			if (!page) return;

			const containers = page.Children();
			if (!containers) return;

			const panelsToFade: GenericPanel[] = [];

			if (this.panels.info) panelsToFade.push(this.panels.info);

			if (this.panels.nav) panelsToFade.push(this.panels.nav);

			if (this.panels.subNav) panelsToFade.push(this.panels.subNav);

			for (const container of containers) {
				for (const child of container.Children()) {
					if (child.id === parent.id) {
						continue;
					}
					panelsToFade.push(child);
				}
			}

			for (const child of parent.Children()) {
				if (child === panel) continue;
				panelsToFade.push(child);
			}

			parent.RemoveClass('settings-group--highlight');
			parent.style.backgroundColor = '#18181800';
			parent.style.borderColor = '#00000000';

			const titleLabel = panel.FindChildTraverse<Label>('Title');
			if (titleLabel) titleLabel.style.textShadowFast = '2px 2px #181818';

			for (const panel of panelsToFade) {
				panel.style.animation = 'FadeOut 0.1s linear 0s 1 normal forwards';
			}

			$.DispatchEvent('MainMenuSetPauseBlur', false);

			this.doingGameFade = true;
		});

		panel.SetPanelEvent('onmouseout', () => {
			if (!this.doingGameFade) return;

			const parent = panel.GetParent();

			if (!parent) return;
			if (!this.activeTab) return;

			const page = this.panels.content.FindChildTraverse(this.activeTab);
			if (!page) return;

			const containers = page.Children();
			if (!containers) return;

			const panelsToFade: GenericPanel[] = [];

			if (this.panels.info) panelsToFade.push(this.panels.info);

			if (this.panels.nav) panelsToFade.push(this.panels.nav);

			if (this.panels.subNav) panelsToFade.push(this.panels.subNav);

			for (const container of containers) {
				for (const child of container.Children()) {
					if (child.id === parent.id) {
						continue;
					}
					panelsToFade.push(child);
				}
			}

			for (const child of parent.Children()) {
				if (child === panel) {
					continue;
				}
				panelsToFade.push(child);
			}

			parent.style.backgroundColor = '#181818';
			parent.style.borderColor = '#555555';

			const titleLabel = panel.FindChildTraverse<Label>('Title');
			if (titleLabel) titleLabel.style.textShadowFast = '0px 0px #00000000';

			for (const panel of panelsToFade) {
				if (panel.IsValid()) panel.style.animation = 'FadeIn 0.1s linear 0s 1 normal forwards';
			}

			$.DispatchEvent('MainMenuSetPauseBlur', true);

			this.doingGameFade = false;
		});
	}

	static initPanelsRecursive(panel) {
		// Initialise info panel event handlers
		if (this.isSettingsPanel(panel)) {
			this.setPanelInfoEvents(panel);
		}

		this.initPanelForPersistentVariable(panel);

		this.initPanelForGameShow(panel);

		// Search all children
		for (const child of panel?.Children() ?? []) {
			this.initPanelsRecursive(child);
		}
	}

	static initPersistentStorageEnum(panel, storageKey) {
		for (const child of panel.FindChildTraverse('values').Children()) {
			// Get the value of enum (usually 0: off, 1: on but they can have more values)
			const value = child.GetAttributeInt('value', -1);

			if (value === -1) continue;

			// 0 if not already set, let the places using the var handle setting a default value
			const storedValue = $.persistentStorage.getItem(storageKey) ?? 0;

			// Check the button if the value matches the stored value
			child.checked = storedValue === value;

			// Extra attribute to allow us to still specify onactivate events in XML
			const overrideString = child.GetAttributeString('activateoverride', '');

			// Create function from XML string
			const activateFn = new Function(overrideString);

			// Setter
			child.SetPanelEvent('onactivate', () => {
				$.persistentStorage.setItem(storageKey, value);
				// Call override function if it exists
				if (overrideString) activateFn();
			});
		}
	}

	static initPersistentStorageEnumDropdown(panel, storageKey) {
		const dropdown = panel.FindChildTraverse('DropDown');

		// Set the selected dropdown to the one stored in PS. Same as above, default to 0
		dropdown.SetSelectedIndex($.persistentStorage.getItem(storageKey) ?? 0);

		// Event overrides, same as above
		const overrideString = panel.GetAttributeString('submitoverride', '');
		const submitFn = new Function(overrideString);

		// Setter + override (if exists)
		panel.SetPanelEvent('oninputsubmit', () => {
			$.persistentStorage.setItem(storageKey, dropdown.GetSelected().GetAttributeInt('value', -1));
			if (overrideString) submitFn();
		});
	}

	static setPanelInfoEvents(panel) {
		const message = panel.GetAttributeString('infomessage', '');
		// Default to true if not set
		const hasDocs = !(panel.GetAttributeString('hasdocspage', '') === 'false');
		panel.SetPanelEvent('onmouseover', () => {
			// Set onmouseover events for all settings panels
			panel.RemoveClass('settings-group--highlight');
			this.showInfo(
				// If a panel has a specific title use that, if not use the panel's name. Child ID names vary between panel types, blame Valve
				panel.GetAttributeString('infotitle', '') ||
					panel.FindChildTraverse('Title')?.text ||
					panel.FindChildTraverse('title')?.text,
				message,
				panel.convar ?? panel.bind,
				hasDocs,
				panel.paneltype
			);
		});
	}

	static showInfo(title, message, convar, hasDocs, paneltype) {
		// Check we're mousing over a different panel than before, i.e. the title, message and convar aren't all equal
		if (title + message + convar === this.currentInfo) return;

		this.currentInfo = title + message + convar;

		// Get convar display option from PS
		const showConvar = Boolean(convar);
		const isKeybinder = paneltype === 'SettingsKeyBinder';

		// If the panel has a message OR a convar and the convar display option is on, show the info panel
		if (message || showConvar) {
			// If the info panel is closed, open it.
			if (this.panels.info.HasClass('settings-info--hidden')) {
				this.panels.info.RemoveClass('settings-info--hidden');
			}

			if (message) {
				this.panels.infoTitle.text = $.Localize(title);
				// I don't want localisation people having to fuss with HTML tags too much so replacing newlines with <br>
				// does linebreaks for us without requiring any <p> tags.
				this.panels.infoMessage.text = $.Localize(message).replace(/\r\n|\r|\n/g, '<br><br>');
				this.panels.infoTitle.RemoveClass('hide');
				this.panels.infoMessage.RemoveClass('hide');
			} else {
				this.panels.infoTitle.AddClass('hide');
				this.panels.infoMessage.AddClass('hide');
			}

			if (showConvar) {
				this.panels.infoConvar.text = `<i>${
					isKeybinder ? $.Localize('#Settings_General_Command') : $.Localize('#Settings_General_Convar')
				}: <b>${convar}</b></i>`;
				this.panels.infoConvar.RemoveClass('hide');
				//this.panels.infoDocsButton.SetHasClass('hide', !hasDocs || isKeybinder);
				// Shouldn't need to clear the panel event here as it's hidden or gets overwritten
				this.panels.infoDocsButton.SetPanelEvent('onactivate', () =>
					SteamOverlayAPI.OpenURLModal(`https://docs.momentum-mod.org/var/${convar}`)
				);
			} else {
				this.panels.infoConvar.AddClass('hide');
				this.panels.infoDocsButton.AddClass('hide');
			}
		} else {
			this.hideInfo();
		}
	}

	static hideInfo() {
		// Hide the info panel
		this.panels.info.AddClass('settings-info--hidden');
	}

	static saveSettings() {
		$.Msg('Writing settings to file...');
		GameInterfaceAPI.ConsoleCommand('host_writeconfig');
	}

	static isSettingsPanel(panel) {
		return [
			'SettingsEnum',
			'SettingsSlider',
			'SettingsEnumDropDown',
			'SettingsKeyBinder',
			'SettingsToggle',
			'ConVarColorDisplay'
		].includes(panel.paneltype);
	}
}
