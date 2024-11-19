'use strict';

class AddonEntry {
	index: number;
	panel: Panel;

	enableText: Label|null = null;
	subText: Label|null = null;

	constructor(index: number, panel: Panel) {
		this.index = index;
		this.panel = panel;

		this.enableText = panel.FindChildTraverse<Label>('AddonEnableText');
		this.subText = panel.FindChildTraverse<Label>('AddonSubscribeText');
	}

	/**
	 * Update the addon with the latest information
	 */
	update() {
		const info = WorkshopAPI.GetAddonMeta(this.index);

		const image = this.panel.FindChild('AddonCover') as Image;
		image.SetImage(info.thumb.length > 0 ? info.thumb : 'file://{images}/menu/missing-cover.png');

		const title = this.panel.FindChildTraverse('AddonTitle') as Label;
		title.text = info.title;

		const desc = this.panel.FindChildTraverse('AddonDesc') as Label;
		desc.text = info.description.split('\n')[0];

		// Add a panel event for the subscribe/unsubscribe button
		const subscribeButton = this.panel.FindChildTraverse('AddonSubscribe') as Button;
		subscribeButton.SetPanelEvent('onactivate', () => this.addonSubscribed());

		if (this.subText)
			this.subText.text = WorkshopAPI.GetAddonSubscribed(this.index) ? 'Unsubscribe' : 'Subscribe';

		// Add a panel event for the enable/disable button
		const enableButton = this.panel.FindChildTraverse('AddonEnable') as Button;
		enableButton.SetPanelEvent('onactivate', () => this.addonEnabled())

		if (this.enableText)
			this.enableText.text = WorkshopAPI.GetAddonEnabled(this.index) ? 'Disable' : 'Enable';

		const source = this.panel.FindChildTraverse('AddonSource') as Label;
		if (info.local)
			source.text = 'Local Addon';
		else
			source.text = 'Workshop Addon ' + info.workshopid;
	}

	/**
	 * Toggle an addon's enable state
	 */
	addonEnabled() {
		WorkshopAPI.SetAddonEnabled(this.index, !WorkshopAPI.GetAddonEnabled(this.index));

		if (this.enableText)
			this.enableText.text = WorkshopAPI.GetAddonEnabled(this.index) ? 'Disable' : 'Enable';
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

	static addons: AddonEntry[];

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

		this.addons = [];

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

	static reloadAddonList() {

	}

}
