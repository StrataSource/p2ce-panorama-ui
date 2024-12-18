'use strict';

class AddonEntry {
	index: number;
	panel: Panel;

	enableText: Label | null = null;
	subText: Label | null = null;
	addonEnableCheck: ToggleButton | null = null;

	constructor(index: number, panel: Panel) {
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
			this.addonEnableCheck.SetPanelEvent('onactivate', () => this.addonToggle());
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
	 * Toggle an addon's enable state
	 */
	addonToggle() {
		AddonManager.markDirty();
	}

	/**
	 * Enable or disable addon (in UI only)
	 * Marks the addon list dirty
	 */
	setAddonEnabled(en: boolean) {
		if (this.addonEnableCheck) {
			if (this.addonEnableCheck.IsSelected() != en) AddonManager.markDirty();
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
	static addonContainer = $<Panel>('#AddonContainer');
	static addonPanel = $<Panel>('#AddonPanel');
	static addonTitle = this.addonPanel?.FindChildTraverse<Label>('AddonTitle');
	static addonDesc = this.addonPanel?.FindChildTraverse<Label>('AddonDesc');
	static addonAuthors = this.addonPanel?.FindChildTraverse<Label>('AddonAuthors');

	static applyButton = $<Button>('#ApplyButton');
	static cancelButton = $<Button>('#CancelButton');
	static toggleAllButton = $<ToggleButton>('#ToggleAll');

	static addons: AddonEntry[] = [];
	static dirty: boolean = false;

	static init() {
		$.RegisterForUnhandledEvent('LayoutReloaded', this.reloadCallback);
		this.createAddonEntries();
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
			const panel = $.CreatePanel('Panel', this.addonContainer, 'addon' + i);
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

	static addonSelected(addon: number) {
		const info = WorkshopAPI.GetAddonMeta(addon);

		if (this.addonTitle) this.addonTitle.text = info.title;

		if (this.addonDesc) this.addonDesc.text = info.description;

		if (info.authors.length > 0 && this.addonAuthors) {
			this.addonAuthors.text = 'by ' + info.authors.join(', ');
			this.addonAuthors.visible = true;
		} else if (this.addonAuthors) {
			this.addonAuthors.text = '';
			this.addonAuthors.visible = false;
		}
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
}
