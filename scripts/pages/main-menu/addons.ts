'use strict';

class AddonManager {
	static addonContainer = $<Panel>('#AddonContainer');
	static addonPanel = $<Panel>('#AddonPanel');
	static addonTitle = this.addonPanel?.FindChildTraverse('AddonTitle') as Label;
	static addonDesc = this.addonPanel?.FindChildTraverse('AddonDesc') as Label;
	static addonAuthors = this.addonPanel?.FindChildTraverse('AddonAuthors') as Label;

	static init() {
		$.RegisterForUnhandledEvent('LayoutReloaded', this.reloadCallback);
		this.createAddonEntries();
	}

	static createAddonEntries() {
		if (!this.addonContainer) return;

		const addonCount = WorkshopAPI.GetAddonCount();
		for (let i = 0; i < addonCount; ++i) {
			const info = WorkshopAPI.GetAddonMeta(i);
			$.Msg(info);
			const panel = $.CreatePanel('Panel', this.addonContainer, 'addon'+i);
			panel.SetPanelEvent('onactivate', () => this.addonSelected(i));
			panel.LoadLayoutSnippet('AddonEntrySnippet');

			const image = panel.FindChild('AddonCover') as Image;
			image.SetImage(info.thumb.length > 0 ? info.thumb : 'file://{images}/menu/missing-cover.png');

			const title = panel.FindChildTraverse('AddonTitle') as Label;
			title.text = info.title;

			const desc = panel.FindChildTraverse('AddonDesc') as Label;
			desc.text = info.description.split('\n')[0];

			const source = panel.FindChildTraverse('AddonSource') as Label;
			if (info.local)
				source.text = 'Local Addon';
			else
				source.text = 'Workshop Addon ' + info.workshopid;
		}
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

}
