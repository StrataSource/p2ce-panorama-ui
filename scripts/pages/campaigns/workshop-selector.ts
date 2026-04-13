'use strict';

class WorkshopSelector {
	static insert = $<Panel>('#EntryInsert')!;
	static searchBar = $<TextEntry>('#SearchBar')!;
	static campaignStrings: Array<AbstractSearchData> = [];

	static init() {
		this.cacheSearch();
		this.populate();

		installSearchHandling<string, string>(
			this.searchBar,
			() => {
				this.deleteEntries();
				this.populate();
			},
			() => {},
			() => {
				return this.campaignStrings;
			},
			(matches: string[]) => {
				this.deleteEntries();
				for (const match of matches) {
					this.createBtnFromString(match);
				}
			}
		);

		$.RegisterForUnhandledEvent('PanoramaComponent_Campaign_OnRefreshList', () => {
			this.searchBar.text = '';
			this.reloadList();
		});
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
		const img = p.FindChildTraverse<Image>('Cover')!;
		installImageFallbackHandler(img);
		img.SetImage(meta.thumb);

		const deps = WorkshopAPI.GetAddonDependenciesMissing(pair.bucket.addon_id);
		const hasMissing = deps !== null && deps.length > 0;

		p.FindChildTraverse<Panel>('Indicator')!.SetHasClass('hide', !hasMissing);

		p.SetPanelEvent('onactivate', () => {
			if (hasMissing) {
				UiToolkitAPI.ShowGenericPopupThreeOptions(
					'[HC] Missing dependencies',
					'[HC] The map you are trying to launch depends on addons you do not have installed. You can continue without downloading, but expect issues with this map.',
					'warning',
					'[HC] View in Workshop',
					() => {
						SteamOverlayAPI.OpenURLModal(
							`https://steamcommunity.com/sharedfiles/filedetails/?id=${meta.workshopid}`
						);
					},
					'[HC] Continue Anyway',
					() => {
						CampaignAPI.StartCampaign(
							`${pair.bucket.id}/${pair.campaign.id}`,
							pair.campaign.chapters[0].id,
							0
						);
					},
					'[HC] Cancel',
					() => {}
				);
			} else {
				CampaignAPI.StartCampaign(
					`${pair.bucket.id}/${pair.campaign.id}`,
					pair.campaign.chapters[0].id,
					0
				);
			}
		});
	}

	static createBtnFromString(campaign: string) {
		const c = CampaignAPI.FindCampaign(campaign);
		if (c) {
			this.createBtn(c);
		} else {
			$.Warning(`Can't find '${campaign}'`);
		}
	}

	static cacheSearch() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		for (const bucket of buckets) {
			if (bucket.id.startsWith('auto_')) {
				const meta = WorkshopAPI.GetAddonMeta(bucket.addon_id);
				const id = `${bucket.id}/${bucket.campaigns[0].id}`;
				this.campaignStrings.push(
					new AbstractSearchData(
						id,
						meta.title,
						id
					)
				);
			}
		}
	}

	static populate() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		for (const bucket of buckets) {
			if (bucket.id.startsWith('auto_')) {
				this.createBtn({ bucket: bucket, campaign: bucket.campaigns[0] });
			}
		}
	}

	static clearCache() {
		this.campaignStrings = [];
	}

	static deleteEntries() {
		this.insert.RemoveAndDeleteChildren();
	}
	
	static reloadList() {
		this.clearCache();
		this.deleteEntries();
		this.populate();
	}
}
