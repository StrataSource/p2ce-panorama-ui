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
		desc.text = info.description.split('\n')[0];

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

class AddonManager {
	static addonContainer = $<Panel>('#AddonContainer')!;
	static addonPanel = $<Panel>('#SelectedAddonPanel')!;
	static addonCover = $<Image>('#SelectedAddonCover')!;
	static addonTitle = $<Label>('#SelectedAddonTitle')!;
	static addonDesc = $<Label>('#SelectedAddonDesc')!;
	static addonAuthors = $<Label>('#SelectedAddonAuthors')!;
	static addonSteam = $<Button>('#SelectedAddonView')!;
	static addonMapsPanel = $<Panel>('#SelectedAddonMapLauncher')!;
	static addonMapsDropdown = $<DropDown>('#SelectedAddonMaps')!;
	static addonsPage = $<Panel>('#AddonsPage')!;

	static applyButton = $<Button>('#ApplyButton');
	static cancelButton = $<Button>('#CancelButton');
	static toggleAllButton = $<ToggleButton>('#ToggleAll');

	static addons: AddonEntry[] = [];
	static dirty: boolean = false;
	static selectedAddon: number = -1;
	static gameMaps: string[] = [];

	static init() {
		this.addonsPage.visible = false;

		$.RegisterForUnhandledEvent('LayoutReloaded', this.reloadCallback.bind(this));
		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onMainMenuTabShown.bind(this));
		this.createAddonEntries();
		this.findMaps();

		$.DispatchEvent('Activated', $<RadioButton>('#ViewAddonsBtn')!, PanelEventSource.MOUSE);
	}

	static showPage() {
		MountManager.hidePage();
		this.addonsPage.visible = true;
	}

	static hidePage() {
		this.addonsPage.visible = false;
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

	static reloadCallback() {
		this.createAddonEntries();
	}

	static onMainMenuTabShown(tabid: string) {
		if (tabid !== 'Addons') return;

		this.selectedAddon = -1;
		this.addonPanel.AddClass('hide');
		this.purgeAddonList();
		this.createAddonEntries();
		this.findMaps();
	}

	static findMaps() {
		this.gameMaps = [];
		const maps = GameInterfaceAPI.GetMaps();

		for (let i = 0; i < maps.length; ++i) {
			if (!maps[i].valid) continue;

			const rawMap: string = maps[i].name;
			const mapName: string = rawMap.substring(5, rawMap.length - 4);
			if (mapName.startsWith('workshop/') || mapName.startsWith('puzzlemaker')) continue;

			this.gameMaps.push(mapName);
		}
	}

	static addonSelected(addon: number) {
		const info = WorkshopAPI.GetAddonMeta(addon);

		this.selectedAddon = addon;

		this.addonPanel.RemoveClass('hide');

		if (this.addonCover)
			this.addonCover.SetImage(info.thumb.length > 0 ? info.thumb : 'file://{images}/menu/missing-cover.png');

		if (this.addonTitle) this.addonTitle.text = info.title;

		if (this.addonDesc) this.addonDesc.text = $.BBCodeToHTML(info.description);

		if (info.authors.length > 0 && this.addonAuthors) {
			this.addonAuthors.text = 'by ' + info.authors.join(', ');
			this.addonAuthors.visible = true;
		} else if (this.addonAuthors) {
			this.addonAuthors.text = '';
			this.addonAuthors.visible = false;
		}

		this.addonSteam.visible = !info.local;

		this.updateSelectedAddonMaps();
	}
	
	static updateSelectedAddonMaps() {
		const info = WorkshopAPI.GetAddonMeta(this.selectedAddon);

		if (!WorkshopAPI.GetAddonEnabled(this.selectedAddon)) {
			this.addonMapsPanel.visible = false;
			return;
		}

		// i dont like this, but...
		const words = info.description.split(/[^a-zA-Z0-9_/]/);
		const matchingMaps: string[] = [];
		for (let i = 0; i < words.length; ++i) {
			const word: string = words[i].trim();
			const result = this.gameMaps.find((value: string, index: number) => {
				return value === `${word}` || `${value}r` === `${word}`;
			});

			if (result) {
				if (matchingMaps.includes(result)) continue;
				matchingMaps.push(result);
			}
		}

		this.addonMapsDropdown.RemoveAllOptions();

		const hasMaps = matchingMaps.length > 0;

		for (let i = 0; i < matchingMaps.length; ++i) {
			const map = matchingMaps[i];
			const entry = $.CreatePanel(
				'Label',
				this.addonMapsDropdown,
				`AddonMap${map}`,
				{ text: map, value: map }
			);
			this.addonMapsDropdown.AddOption(entry);
		}

		this.addonMapsDropdown.SetSelectedIndex(0);

		this.addonMapsPanel.visible = hasMaps;
	}

	static launchSelectedAddonMap() {
		const selected = this.addonMapsDropdown.GetSelected();
		if (selected === null) return;

		const map = selected.GetAttributeString('value', 'null');
		if (map === null || map === 'null') return;

		GameInterfaceAPI.ConsoleCommand(`map ${map}`);
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

		if (this.cancelButton) this.cancelButton.enabled = this.dirty;

		if (this.applyButton) this.applyButton.enabled = this.dirty;
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

		this.updateSelectedAddonMaps();
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

		this.updateSelectedAddonMaps();
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
}

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
		// don't flood the API with requests, just bail out
		if (this.steamApps.length > 20) return;

		const BASE_API_URL = 'https://store.steampowered.com/api/appdetails/?appids=';

		for (let i = 0; i < this.steamApps.length; ++i) {
			try {
				$.AsyncWebRequest(
					`${BASE_API_URL}${this.steamApps[i]}`,
					{ type: 'GET', complete: this.onAppRequestResponse.bind(this) }
				);
			} catch (error) {
				$.Warning(`AsyncWebRequest for Mount ${this.steamApps[i]} failed: ${error}`);
				this.onAppRequestFailed();
			}
		}
	}

	static onAppRequestFailed(appId?: number) {
		$.Warning('Failed to retrieve App ID details.');

		const p = $.CreatePanel('Panel', this.mountsList, `Mount${appId}`);
		p.LoadLayoutSnippet('MountEntrySnippet');

		this.mountEntries.push(new MountEntry(p, 'Unable to retrieve App Name', 'file://{images}/menu/unknown-app-header.png', `${appId ? appId : 'UNKNOWN'}`));
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

		const p = $.CreatePanel('Panel', this.mountsList, `Mount${appId}`);
		p.LoadLayoutSnippet('MountEntrySnippet');

		this.mountEntries.push(new MountEntry(p, appInfo['name'], appInfo['header_image'], appId));
		this.mountEntries[this.mountEntries.length - 1].update();
	}
}
