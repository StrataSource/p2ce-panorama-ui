'use strict';

class WorkshopSelector {
	static insert = $<Panel>('#EntryInsert')!;

	static init() {
		this.populate();
	}

	static createBtn(pair: CampaignPair) {
		const p = $.CreatePanel(
			'Button',
			this.insert,
			pair.bucket.id,
		);
		p.LoadLayoutSnippet('WorkshopEntrySnippet');
		p.SetDialogVariable('name', pair.campaign.title);

		const meta = WorkshopAPI.GetAddonMeta(pair.bucket.addon_id);
		const img = p.FindChild<Image>('Cover')!;
		img.SetImage(meta.thumb);

		p.SetPanelEvent('onactivate', () => {
			CampaignAPI.StartCampaign(
				`${pair.bucket.id}/${pair.campaign.id}`,
				pair.campaign.chapters[0].id,
				0
			);
		});
	}

	static populate() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		for (const bucket of buckets) {
			if (bucket.id.startsWith('auto_')) {
				this.createBtn({ bucket: bucket, campaign: bucket.campaigns[0] });
			}
		}
	}

	static clear() {

	}
}
