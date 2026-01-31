'use strict'

class CampaignMapSelect {
	static list = $<Panel>('#SettingPageInsert')!;
	static onLoad() {
		const campaign = CampaignAPI.GetActiveCampaign()!;
		const chapter = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] as ChapterInfo;

		// determine if any of these maps use an image, if they are, enable img grid mode
		let useImages = false;
		for (const map of chapter.maps) {
			const img = map.meta['img'];
			if (img) {
				useImages = true;
				break;
			}
		}
		this.list.SetHasClass('campaign-maps__list', !useImages);

		for (const map of chapter.maps) {
			const p = $.CreatePanel('RadioButton', this.list, `Map_${map.name}`);
			p.LoadLayoutSnippet('MapEntrySnippet');
			p.SetHasClass('campaign-maps__entry__no-img', !useImages);
			const cover = p.FindChildTraverse<Image>('Cover');
			const title = p.FindChildTraverse<Label>('Title');
			if (cover) {
				if (useImages) {
					const img = map.meta['img'];
					if (img) cover.SetImage(`${getCampaignAssetPath(campaign)}${img}`);
					else cover.SetImage(getRandomFallbackImage());
				}
			}
			if (title) {
				const text = map.meta['title'];
				if (text) title.text = text;
				else title.text = map.name;
			}
			const curMap = CampaignShared.getMap();
			if (curMap === map.name) {
				p.SetSelected(true);
			}
			p.SetPanelEvent('onactivate', () => {
				CampaignShared.setMap(map.name);
				$.Msg(`CAMPAIGN MAP SELECTOR: Set map to ${map.name}`)
			});
		}
	}
}
