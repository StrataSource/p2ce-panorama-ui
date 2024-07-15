'use strict';

class AddonManager {
	static addonContainer = $<Panel>('#AddonContainer');

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
			panel.SetPanelEvent('onactivate', () => AddonManager.addonSelected(i));
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
		$.Msg('Select ' + addon);
	}

}
