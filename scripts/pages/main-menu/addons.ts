'use strict';

class AddonEntry {
	index: number;
	panel: RadioButton;

	enableText: Label | null = null;
	subText: Label | null = null;
	addonEnableCheck: ToggleButton | null = null;

	constructor(index: number, panel: RadioButton) {
		this.index = index;
		this.panel = panel;

		this.subText = panel.FindChildTraverse<Label>('AddonSubscribeText');
		this.addonEnableCheck = this.panel.FindChildTraverse<ToggleButton>('AddonEnable');
	}

	/**
	 * Update the addon with the latest information
	 */
	update() {
		const info = WorkshopAPI.GetAddonMeta(this.index);

		const image = this.panel.FindChildTraverse('AddonCover') as Image;
		image.SetImage(info.thumb.length > 0 ? info.thumb : 'file://{images}/menu/missing-cover.png');

		const title = this.panel.FindChildTraverse('AddonTitle') as Label;
		title.text = info.title;

		const desc = this.panel.FindChildTraverse('AddonDesc') as Label;
		// This looks real stupid but let me explain, it take the first line of the description, strips the BBCode, then strips the trailing r that occurs due to improper stripping by WorkshopAPI.GetAddonMeta.
		desc.text = info.description
			.split('\n')[0]
			.replace(/\[\/?\w+.*?\]/g, '')
			.replace(/r\s*$/, '');

		if (this.addonEnableCheck) {
			this.addonEnableCheck.SetSelected(WorkshopAPI.GetAddonEnabled(this.index));
			this.addonEnableCheck.SetPanelEvent('onactivate', () => AddonManager.markDirty());
		}

		if (this.subText) this.subText.text = WorkshopAPI.GetAddonSubscribed(this.index) ? 'Unsubscribe' : 'Subscribe';

		const source = this.panel.FindChildTraverse('AddonSource') as Label;
		if (info.local) source.text = 'Local Addon';
		else source.text = 'Workshop Addon ' + info.workshopid;
	}

	/**
	 * Update enabled state from Workshop API
	 */
	updateEnabled() {
		this.addonEnableCheck?.SetSelected(WorkshopAPI.GetAddonEnabled(this.index));
	}

	/**
	 * Returns if the addon is enabled or not
	 */
	isEnabled(): boolean {
		if (this.addonEnableCheck) return this.addonEnableCheck.IsSelected();
		return false;
	}

	/**
	 * Enable or disable addon (in UI only)
	 * Marks the addon list dirty
	 */
	setAddonEnabled(en: boolean) {
		if (this.addonEnableCheck) {
			if (this.addonEnableCheck.IsSelected() !== en) AddonManager.markDirty();
			this.addonEnableCheck.SetSelected(en);
		}
	}

	/**
	 * Toggle an addon's subscription state
	 */
	addonSubscribed() {
		WorkshopAPI.SetAddonSubscribed(this.index, !WorkshopAPI.GetAddonSubscribed(this.index));

		if (this.subText) this.subText.text = WorkshopAPI.GetAddonSubscribed(this.index) ? 'Unsubscribe' : 'Subscribe';
	}
}

// Main addons

class Addon {
	index: number;
	meta: AddonMeta;

	constructor(index: number, meta: AddonMeta) {
		this.index = index;
		this.meta = meta;
	}
}

class AddonManager {
	static addonContainer = $<Panel>('#AddonContainer')!;
	static addonPanel = $<Panel>('#SelectedAddonPanel')!;
	static addonCover = $<Image>('#SelectedAddonCover')!;
	static addonTitle = $<Label>('#SelectedAddonTitle')!;
	static addonDesc = $<Label>('#SelectedAddonDesc')!;
	static addonAuthors = $<Label>('#SelectedAddonAuthors')!;
	static addonSteam = $<Button>('#SelectedAddonView')!;
	static addonsPage = $<Panel>('#AddonsPage')!;

	static applyButton = $<Button>('#ApplyButton');
	static cancelButton = $<Button>('#CancelButton');
	static toggleAllButton = $<ToggleButton>('#ToggleAll');

	static searchBar = $<TextEntry>('#SearchAddonsEntry')!;
	static filtersBtn = $<Button>('#ViewFilters')!;

	static addons: AddonEntry[] = [];
	static dirty: boolean = false;
	static selectedAddon: number = -1;

	static init() {
		this.addonsPage.visible = false;

		$.RegisterForUnhandledEvent('LayoutReloaded', this.reloadCallback.bind(this));
		this.createAddonEntries();

		$.DispatchEvent('Activated', $<RadioButton>('#ViewAddonsBtn')!, PanelEventSource.MOUSE);
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Addons'),
			$.Localize('#MainMenu_Navigation_Addons_Tagline')
		);
	}

	static showPage() {
		MountManager.hidePage();
		this.addonsPage.visible = true;
	}

	static hidePage() {
		this.addonsPage.visible = false;
		this.addonPanel.AddClass('hide');

		const addonChildren = this.addonContainer.Children();
		for (let i = 0; i < addonChildren.length; ++i) {
			const child = addonChildren[i];

			if (child.paneltype !== 'RadioButton') continue;
			(child as RadioButton).SetSelected(false);
		}
	}

	static updateAddons() {
		for (const addon of this.addons) {
			addon.update();
		}
	}

	/**
	 * Populate the initial list of addon entries
	 */
	static createAddonEntries() {
		if (!this.addonContainer) return;

		this.purgeAddonList();

		const addonCount = WorkshopAPI.GetAddonCount();
		let anyEnabled = false;
		for (let i = 0; i < addonCount; ++i) {
			const panel = $.CreatePanel('RadioButton', this.addonContainer, 'addon' + i);
			panel.SetPanelEvent('onactivate', () => this.addonSelected(i));
			panel.LoadLayoutSnippet('AddonEntrySnippet');

			if (WorkshopAPI.GetAddonEnabled(i)) anyEnabled = true;

			this.addons.push(new AddonEntry(i, panel));
		}

		// If any addons are enabled, we'll default the "select all" button to true
		if (this.toggleAllButton) this.toggleAllButton.SetSelected(anyEnabled);

		this.updateAddons();
	}

	static createPredefinedAddonEntries(addons: Addon[]) {
		if (!this.addonContainer) return;

		this.purgeAddonList();

		for (const addon of addons) {
			const panel = $.CreatePanel('RadioButton', this.addonContainer, 'addon' + addon.index);
			panel.SetPanelEvent('onactivate', () => this.addonSelected(addon.index));
			panel.LoadLayoutSnippet('AddonEntrySnippet');

			this.addons.push(new AddonEntry(addon.index, panel));
		}

		this.updateAddons();
	}

	static reloadCallback() {
		this.createAddonEntries();
	}

	static onMainMenuTabShown(tabid: string) {
		if (tabid !== 'Addons') return;

		this.selectedAddon = -1;
		this.addonPanel.AddClass('hide');
		this.purgeAddonList();
		this.createAddonEntries();
	}

	static addonSelected(addon: number) {
		const info = WorkshopAPI.GetAddonMeta(addon);

		this.selectedAddon = addon;

		this.addonPanel.RemoveClass('hide');

		if (this.addonCover)
			this.addonCover.SetImage(info.thumb.length > 0 ? info.thumb : 'file://{images}/menu/missing-cover.png');

		if (this.addonTitle) {
			this.addonTitle.text = info.title;
		}

		if (this.addonDesc) {
			this.addonDesc.text = $.BBCodeToHTML(info.description);
		}

		if (info.authors.length > 0 && this.addonAuthors) {
			this.addonAuthors.text = 'by ' + info.authors.join(', ');
			this.addonAuthors.visible = true;
		} else if (this.addonAuthors) {
			this.addonAuthors.text = '';
			this.addonAuthors.visible = false;
		}

		this.addonSteam.visible = !info.local;
	}

	/**
	 * View currently selected addon index on Steam Workshop
	 */
	static viewSelectedOnSteam() {
		if (this.selectedAddon === -1) return;

		const info = WorkshopAPI.GetAddonMeta(this.selectedAddon);
		SteamOverlayAPI.OpenURL(`https://steamcommunity.com/sharedfiles/filedetails/?id=${info.workshopid}`);
	}

	/**
	 * Signal that a change to the addon list has been made
	 */
	static markDirty(dirty: boolean = true) {
		this.dirty = dirty;

		this.searchBar.enabled = !dirty;

		if (this.cancelButton) this.cancelButton.enabled = this.dirty;

		if (this.applyButton) this.applyButton.enabled = this.dirty;
	}

	static changeFilters() {
		UiToolkitAPI.ShowCustomLayoutPopup('FiltersMenu', 'file://{resources}/layout/modals/popups/addon-filters.xml');
	}

	/**
	 * Apply changes to the addon list
	 */
	static apply() {
		if (!this.dirty) return;
		$.Msg('Applying addon changes');

		const enableList = {};
		for (const addon of this.addons) {
			enableList[addon.index] = addon.isEnabled();
		}
		WorkshopAPI.SetAddonListEnabled(enableList);
		this.markDirty(false);

		// Update UI to reflect the new enable/disable state
		for (const addon of this.addons) {
			addon.updateEnabled();
		}
	}

	/**
	 * Cancel changes made to the addon list
	 */
	static cancel() {
		if (!this.dirty) return;

		$.Msg('Reverting addon changes');

		let anyEnabled = false;
		for (const addon of this.addons) {
			addon.updateEnabled();
			if (addon.isEnabled()) anyEnabled = true;
		}

		this.markDirty(false);

		if (this.toggleAllButton) this.toggleAllButton.SetSelected(anyEnabled);
	}

	/**
	 * Toggle all addons on or off
	 */
	static toggleAll() {
		if (!this.toggleAllButton) return;

		const enable = this.toggleAllButton.IsSelected();
		for (const addon of this.addons) {
			addon.setAddonEnabled(enable);
		}
	}

	static purgeAddonList() {
		while (this.addons.length > 0) this.addons.pop()?.panel.DeleteAsync(0);
	}

	static reloadAddonList() {
		this.purgeAddonList();
		this.createAddonEntries();
	}

	// TODO: this should create an array that respects the user's
	// filtering settings. this is used in conjunction with the search
	// request as well. for now, we will return everything.
	//
	// TODO: also make this as part of the addonmanager class instead
	// of reconstructing it on every call, that's yikes!
	static getFilteredAddonsArray() {
		const addons: Addon[] = [];
		const count = WorkshopAPI.GetAddonCount();
		for (let i = 0; i < count; ++i) {
			const info = WorkshopAPI.GetAddonMeta(i);
			addons.push(new Addon(i, info));
		}
		return addons;
	}
}

// Searching

class SearchMatch {
	addon: Addon;
	matchedWith: unknown;

	constructor(addon: Addon, matchedWith: unknown) {
		this.addon = addon;
		this.matchedWith = matchedWith;
	}
}

class AddonSearch {
	static searchBar = $<TextEntry>('#SearchAddonsEntry')!;
	static strings: string[] = [];
	static matches: SearchMatch[] = [];

	static {
		this.searchBar.RaiseChangeEvents(true);
		$.RegisterEventHandler('TextEntryChanged', this.searchBar, this.onSearchTextChanged.bind(this));
	}

	static onSearchTextChanged() {
		const search = this.searchBar.text;
		// check empty
		if (!/.*\S.*/.test(search)) {
			AddonManager.reloadAddonList();
			return;
		}

		// split
		this.strings = search.split(/\s/).filter((s) => /^\w+$/.test(s));

		// don't show one char words
		if (!this.strings.some((str) => str.length > 1)) return;

		this.matches = [];

		const addons = AddonManager.getFilteredAddonsArray();
		for (const searchPart of this.strings) {
			if (!searchPart) {
				break;
			}

			for (const addon of addons) {
				const testLower = addon.meta.title.toLowerCase();
				const index = testLower.indexOf(searchPart.toLowerCase());

				if (index === -1) {
					continue;
				}

				this.matches.push(new SearchMatch(addon, undefined));
			}
		}

		const sendAddons: Addon[] = [];
		for (const match of this.matches) {
			sendAddons.push(match.addon);
		}
		AddonManager.createPredefinedAddonEntries(sendAddons);
	}
}

// Mounting

class MountEntry {
	panel: Panel;
	name: string;
	capsuleUrl: string;
	appid: string;

	constructor(panel: Panel, name: string, capsuleUrl: string, appid: string) {
		this.panel = panel;
		this.name = name;
		this.capsuleUrl = capsuleUrl;
		this.appid = appid;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('MountTitle');
		const appid = this.panel.FindChildTraverse<Label>('MountAppId');
		const cover = this.panel.FindChildTraverse<Image>('MountCover');

		if (title) {
			title.text = this.name;
		}
		if (appid) {
			appid.text = this.appid;
		}
		if (cover) {
			cover.SetImage(this.capsuleUrl);
		}
	}
}

class MountManager {
	static mountsList = $<Panel>('#MountContainer')!;
	static mountsPage = $<Panel>('#MountsPage')!;

	static steamApps: number[] = [];
	static mountEntries: MountEntry[] = [];

	static init() {
		this.mountsPage.visible = false;

		this.steamApps = GameInterfaceAPI.GetMountedSteamApps();
		this.populateMountEntries();
	}

	static showPage() {
		AddonManager.hidePage();
		this.mountsPage.visible = true;
	}

	static hidePage() {
		this.mountsPage.visible = false;
	}

	static populateMountEntries() {
		// don't flood the API with requests
		const MAX_MOUNTS_DISPLAYED = 10;
		const BASE_API_URL = 'https://store.steampowered.com/api/appdetails/?appids=';

		// warn user
		if (this.steamApps.length > MAX_MOUNTS_DISPLAYED) {
			UiToolkitAPI.ShowGenericPopupOk(
				'High Mount Count',
				`You have ${this.steamApps.length} games mounted. For technical reasons, only ${MAX_MOUNTS_DISPLAYED} will be properly displayed.`,
				'generic-popup',
				() => {}
			);
		}

		// make requests
		const maxAppCount = Math.min(MAX_MOUNTS_DISPLAYED, this.steamApps.length);
		for (let i = 0; i < maxAppCount; ++i) {
			try {
				$.AsyncWebRequest(`${BASE_API_URL}${this.steamApps[i]}`, {
					type: 'GET',
					complete: this.onAppRequestResponse.bind(this)
				});
			} catch (error) {
				$.Warning(`ADDONS: AsyncWebRequest for Mount ${this.steamApps[i]} failed: ${error}`);
				this.onAppRequestFailed();
			}
		}

		// do the rest if there's still more
		for (let i = maxAppCount; i < this.steamApps.length; ++i) {
			const appId = this.steamApps[i];

			const p = $.CreatePanel('Panel', this.mountsList, `Mount${appId}`);
			p.LoadLayoutSnippet('MountEntrySnippet');

			this.mountEntries.push(
				new MountEntry(
					p,
					`AppID: ${appId}`,
					'file://{images}/menu/unknown-app-header.png',
					'Maximum displayed mount count reached.'
				)
			);
			this.mountEntries[this.mountEntries.length - 1].update();
		}
	}

	static onAppRequestFailed(appId?: number) {
		$.Warning('ADDONS: Failed to retrieve App ID details.');

		const p = $.CreatePanel('Panel', this.mountsList, `Mount${appId}`);
		p.LoadLayoutSnippet('MountEntrySnippet');

		this.mountEntries.push(
			new MountEntry(
				p,
				'Unable to retrieve App Name',
				'file://{images}/menu/unknown-app-header.png',
				`${appId ? appId : 'UNKNOWN'}`
			)
		);
		this.mountEntries[this.mountEntries.length - 1].update();
	}

	static onAppRequestResponse(data) {
		if (data.statusText !== 'success') {
			this.onAppRequestFailed();
			return;
		}

		const response = JSON.parse(data.responseText.substring(0, data.responseText.length - 1));
		const appId = Object.keys(response)[0];
		const appInfo = response[Object.keys(response)[0]]['data'];

		if (appInfo === undefined) {
			this.onAppRequestFailed(appId ? Number(appId) : undefined);
			return;
		}

		const p = $.CreatePanel('Panel', this.mountsList, `Mount${appId}`);
		p.LoadLayoutSnippet('MountEntrySnippet');

		this.mountEntries.push(new MountEntry(p, appInfo['name'], appInfo['header_image'], appId));
		this.mountEntries[this.mountEntries.length - 1].update();
	}
}
