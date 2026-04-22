/* eslint-disable camelcase */

'use strict';

class FeaturedSubMenu {
	static index = UiToolkitAPI.GetGlobalObject()['featuredIndex'] as number;
	static section = FeaturedSections[this.index];
	static actionBar = $<Panel>('#ActionBar')!;
	static contentChild = $<Panel>('#ContentChild')!;
	static contentPanels: Array<Panel> = [];

	static {
		$.RegisterForUnhandledEvent('MainMenuPagePreClose', () => {
			$.DispatchEvent('MainMenuHideFeaturedOverlay');
		});
	}

	static onLoad() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize(this.section.title),
			'[HC] Featured content for this period'
		);

		$.DispatchEvent(
			'MainMenuShowFeaturedOverlay',
			this.section.image
		);

		for (const key of Object.keys(this.section.content)) {
			const contentPanel = $.CreatePanel('Panel', this.contentChild, `${key}`);
			contentPanel.LoadLayoutSnippet('ContentChildSnippet');
			const composedIds: Array<PublishedFileId_t> = [];
			for (const value of this.section.content[key]) {
				composedIds.push(BigInt(value));
				const p = $.CreatePanel('Button', contentPanel, `${value}`);
				p.LoadLayoutSnippet('EntrySnippet');
			}
			WorkshopAPI.CreateQueryUGCDetailsRequest(
				(success: boolean, data: Array<SteamUGCDetails_t> | null) => {
					if (!success || !data) return;
					for (const item of data) {
						const panel = contentPanel.FindChild(`${item.m_nPublishedFileId}`);
						$.Msg(`Received: '${item.m_rgchTitle}'`);
						if (!panel) continue;
						panel.SetDialogVariable('name', item.m_rgchTitle);
						const img = panel.FindChildTraverse<Image>('Cover');
						if (img) {
							img.SetImage(item.m_rgchPreviewUrl);
						}
						const loader = panel.FindChildTraverse<Panel>('Loader');
						if (loader) {
							loader.visible = false;
						}
					}
				},
				composedIds
			);
			this.contentPanels.push(contentPanel);

			const btn = $.CreatePanel('RadioButton', this.actionBar, `ActionBar_${key}`);
			btn.LoadLayoutSnippet('ActionBarEntrySnippet');
			btn.SetDialogVariable('text', key);
			btn.SetPanelEvent('onactivate', () => {
				for (const panel of this.contentPanels) {
					panel.visible = false;
					panel.ScrollToTop();
				}
				contentPanel.visible = true;
			});
		}

		if (this.actionBar.Children().length > 0) {
			$.DispatchEvent('Activated', this.actionBar.Children()[0] as RadioButton, PanelEventSource.PROGRAM);
		}
	}
}
