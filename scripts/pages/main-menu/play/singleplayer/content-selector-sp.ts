'use strict';

class ContentSelectorSP {
	static insert = $<Panel>('#Insert')!;
	static tabs = $<Panel>('#Tabs')!;
	static pages = ['main-menu/play/campaign-selector', 'main-menu/play/automap-selector', 'main-menu/play/p2-selector'];
	static btns = [$<RadioButton>('#CampaignsBtn')!, $<RadioButton>('#MapsBtn')!, $<RadioButton>('#Portal2Btn')!];

	static onLoad() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			this.tabs.visible = false;
			this.onTabSelected(1, false);
			return;
		}

		const lastTab = $.persistentStorage.getItem(MiscStorageKeys.CONTENT_TAB);
		let tabNumber = 0;
		if (lastTab === null) {
			$.persistentStorage.setItem(MiscStorageKeys.CONTENT_TAB, 0);
		} else {
			tabNumber = Number(lastTab);

			// guard against future changes
			if (tabNumber > this.btns.length - 1) {
				$.persistentStorage.setItem(MiscStorageKeys.CONTENT_TAB, 0);
				tabNumber = 0;
			}
		}
		const btn = this.btns[tabNumber];
		btn.SetFocus();
		$.DispatchEvent('Activated', btn, PanelEventSource.PROGRAM);
	}

	static onTabSelected(index: number, bSave: boolean) {
		this.insert.RemoveAndDeleteChildren();
		const p = $.CreatePanel('Panel', this.insert, `Page${index}`);
		p.LoadLayout(`file://{resources}/layout/pages/${this.pages[index]}.xml`, false, false);

		// switched to a page that isn't the p2 selector
		$.DispatchEvent('MainMenuHideFeaturedOverlay');

		if (bSave) $.persistentStorage.setItem(MiscStorageKeys.CONTENT_TAB, index);
	}
}
