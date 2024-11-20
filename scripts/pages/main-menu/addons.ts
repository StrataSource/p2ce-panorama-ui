'use strict';

class AddonEntry {
	index: number;
	panel: Panel;

	enableText: Label|null = null;
	subText: Label|null = null;
	addonEnableCheck: ToggleButton|null = null;

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

		if (this.subText)
			this.subText.text = WorkshopAPI.GetAddonSubscribed(this.index) ? 'Unsubscribe' : 'Subscribe';

		const source = this.panel.FindChildTraverse('AddonSource') as Label;
		if (info.local)
			source.text = 'Local Addon';
		else
			source.text = 'Workshop Addon ' + info.workshopid;
	}

	/**
	 * Toggle an addon's enable state
	 */
	addonToggle() {
		if (this.addonEnableCheck)
			WorkshopAPI.SetAddonEnabled(this.index, this.addonEnableCheck.IsSelected());
	}

	/**
	 * Toggle an addon's subscription state
	 */
	addonSubscribed() {
		WorkshopAPI.SetAddonSubscribed(this.index, !WorkshopAPI.GetAddonSubscribed(this.index));

		if (this.subText) 
			this.subText.text = WorkshopAPI.GetAddonSubscribed(this.index) ? 'Unsubscribe' : 'Subscribe';
	}

};

class AddonManager {
	static addonContainer = $<Panel>('#AddonContainer');
	static addonPanel = $<Panel>('#AddonPanel');
	static addonTitle = this.addonPanel?.FindChildTraverse('AddonTitle') as Label;
	static addonDesc = this.addonPanel?.FindChildTraverse('AddonDesc') as Label;
	static addonAuthors = this.addonPanel?.FindChildTraverse('AddonAuthors') as Label;

	static addons: AddonEntry[] = [];

	static init() {
		$.RegisterForUnhandledEvent('LayoutReloaded', this.reloadCallback);
		this.createAddonEntries();
	}

	static updateAddons() {
		this.addons.forEach(element => {
			element.update();
		});
	}

	/**
	 * Populate the initial list of addon entries
	 */
	static createAddonEntries() {
		if (!this.addonContainer) return;

		this.purgeAddonList();

		const addonCount = WorkshopAPI.GetAddonCount();
		for (let i = 0; i < addonCount; ++i) {
			const panel = $.CreatePanel('Panel', this.addonContainer, 'addon'+i);
			panel.SetPanelEvent('onactivate', () => this.addonSelected(i));
			panel.LoadLayoutSnippet('AddonEntrySnippet');

			this.addons.push(new AddonEntry(i, panel));
		}

		this.updateAddons();
	}

	static reloadCallback() {
		this.createAddonEntries();
	}

	static addonSelected(addon: number) {
		const info = WorkshopAPI.GetAddonMeta(addon);

		this.addonTitle.text = info.title;
		this.addonDesc.text = info.description;
		if (info.authors.length > 0) {
			this.addonAuthors.text = 'by ' + info.authors.join(', ');
			this.addonAuthors.visible = true;
		}
		else {
			this.addonAuthors.text = '';
			this.addonAuthors.visible = false;
		}
	}

	static enableAll() {

	}

	static disableAll() {

	}

	static purgeAddonList() {
		while (this.addons.length > 0)
			this.addons.pop()?.panel.DeleteAsync(0);
	}

	static reloadAddonList() {
		this.purgeAddonList();
		this.createAddonEntries();
	}

}
