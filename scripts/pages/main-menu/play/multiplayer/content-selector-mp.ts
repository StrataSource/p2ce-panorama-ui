'use strict';

class ContentSelectorMP {
	static insert = $<Panel>('#Insert')!;
	static tabs = $<Panel>('#Tabs')!;
	static pages = ['main-menu/play/campaign-selector', 'main-menu/play/automap-selector'];
	static btns = [$<RadioButton>('[HC] Join Game')!, $<RadioButton>('[HC] Create Game')!];

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
			if (tabNumber > this.btns.length) {
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

		if (bSave) $.persistentStorage.setItem(MiscStorageKeys.CONTENT_TAB, index);
	}
}
