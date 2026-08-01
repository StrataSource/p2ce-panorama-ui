'use strict';

class ContentSelectorMP {
	static insert = $<Panel>('#Insert')!;
	static topBtns = [$<RadioButton>('#CreateBtn')!, $<RadioButton>('#JoinBtn')!];
	static createTabs = $<Panel>('#CreateTabs')!;
	static createBtns = [$<RadioButton>('#CampaignsBtn')!, $<RadioButton>('#MapsBtn')!, $<RadioButton>('#Portal2Btn')!];
	static createPages = ['main-menu/play/campaign-selector', 'main-menu/play/automap-selector', 'main-menu/play/p2-selector'];
	static joinTabs = $<Panel>('#JoinTabs')!;
	static joinBtns = [$<RadioButton>('#FriendsBtn')!, $<RadioButton>('#BrowserBtn')!];
	static joinPages = ['main-menu/placeholder', 'main-menu/placeholder'];
	static isJoin = false;

	static onLoad() {
		const lastTab = $.persistentStorage.getItem(MiscStorageKeys.MP_CONTENT_TAB);
		let tabNumber = 0;
		if (lastTab === null) {
			$.persistentStorage.setItem(MiscStorageKeys.MP_CONTENT_TAB, 0);
		} else {
			tabNumber = Number(lastTab);

			// guard against future changes
			if (tabNumber > this.topBtns.length - 1) {
				$.persistentStorage.setItem(MiscStorageKeys.MP_CONTENT_TAB, 0);
				tabNumber = 0;
			}
		}
		const btn = this.topBtns[tabNumber];
		btn.SetFocus();
		$.DispatchEvent('Activated', btn, PanelEventSource.PROGRAM);
	}

	static onTopTabSelected(index: number, bSave: boolean) {
		this.isJoin = index === 1;
		this.createTabs.AddClass('hide');
		this.joinTabs.AddClass('hide');
		switch (index) {
			default:
			case 0:
				{
					this.createTabs.RemoveClass('hide');
					const btn = this.createBtns[0];
					btn.SetFocus();
					$.DispatchEvent('Activated', btn, PanelEventSource.PROGRAM);
				}
				break;
			case 1:
				{
					this.joinTabs.RemoveClass('hide');
					const btn = this.joinBtns[0];
					btn.SetFocus();
					$.DispatchEvent('Activated', btn, PanelEventSource.PROGRAM);
				}
				break;
		}
		if (bSave) $.persistentStorage.setItem(MiscStorageKeys.MP_CONTENT_TAB, index);
	}

	static onSubTabSelected(index: number) {
		const pageGroup = this.isJoin ? this.joinPages : this.createPages;
		this.insert.RemoveAndDeleteChildren();
		const p = $.CreatePanel('Panel', this.insert, `Page${index}`);
		p.LoadLayout(`file://{resources}/layout/pages/${pageGroup[index]}.xml`, false, false);

		$.DispatchEvent('MainMenuHideFeaturedOverlay');
	}
}
