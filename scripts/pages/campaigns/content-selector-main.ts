'use strict';

class ContentSelector {
	static insert = $<Panel>('#Insert')!;
	static pages = [
		'campaigns/campaign-selector',
		'campaigns/workshop-selector',
	];
	static btns = [
		$<RadioButton>('#CampaignsBtn')!,
		$<RadioButton>('#MapsBtn')!,
	]

	static onLoad() {
		$.DispatchEvent('Activated', this.btns[0], PanelEventSource.PROGRAM);
	}

	static onTabSelected(index: number) {
		this.insert.RemoveAndDeleteChildren();
		const p = $.CreatePanel('Panel', this.insert, `Page${index}`);
		p.LoadLayout(`file://{resources}/layout/pages/${this.pages[index]}.xml`, false, false);
	}
}
