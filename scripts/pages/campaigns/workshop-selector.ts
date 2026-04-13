'use strict';

class WorkshopEntry {
	button: Button;
	hasMissing: boolean;
	// shut up i dont care
	// eslint-disable-next-line camelcase
	addonId: AddonIndex_t;
	campaignId: string;
	startId: string;
	indicatorOverlay: Panel;

	constructor(pair: CampaignPair) {
		this.button = $.CreatePanel(
			'Button',
			WorkshopSelector.insert,
			pair.bucket.id,
		);

		this.button.LoadLayoutSnippet('WorkshopEntrySnippet');
		this.button.SetDialogVariable('name', pair.campaign.title);

		this.addonId = pair.bucket.addon_id;
		this.campaignId = `${pair.bucket.id}/${pair.campaign.id}`;

		const meta = WorkshopAPI.GetAddonMeta(pair.bucket.addon_id);
		const img = this.button.FindChildTraverse<Image>('Cover')!;
		installImageFallbackHandler(img);
		img.SetImage(meta.thumb);

		this.indicatorOverlay = this.button.FindChildTraverse<Panel>('Indicator')!;

		// SHUT UPPPPPPPPPPP!!!!!!
		this.hasMissing = false;
		this.updateDependencies();

		this.startId = pair.campaign.chapters[0].id;

		this.button.SetPanelEvent('onactivate', () => {
			if (this.hasMissing) {
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
							this.campaignId,
							this.startId,
							0
						);
					},
					'[HC] Cancel',
					() => {}
				);
			} else {
				CampaignAPI.StartCampaign(
					this.campaignId,
					this.startId,
					0
				);
			}
		});
	}

	updateDependencies() {
		const deps = WorkshopAPI.GetAddonDependenciesMissing(this.addonId);
		this.hasMissing = deps !== null && deps.length > 0;
		if (this.hasMissing) {
			$.Msg(`${this.campaignId} MISSING DEPENDENCIES (${deps!.length})`);
			for (const dep of deps!) {
				$.Msg(`     ${dep}`);
			}
		} else {
			$.Msg(`${this.campaignId} OK`);
		}
		this.indicatorOverlay.SetHasClass('hide', !this.hasMissing);
	}
}

class WorkshopSelector {
	static insert = $<Panel>('#EntryInsert')!;
	static searchBar = $<TextEntry>('#SearchBar')!;
	static campaignStrings: Array<AbstractSearchData> = [];
	static entries: Array<WorkshopEntry> = [];

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

		// FIXME: event not firing?
		$.RegisterForUnhandledEvent(
			'PanoramaComponent_Workshop_OnAddonInstalled',
			() => {
				$.Msg('Addon installation detected!');
				for (const entry of this.entries) {
					if (entry.hasMissing) {
						$.Msg(`Checking dependencies of ${entry.campaignId} again...`);
						entry.updateDependencies();
					}
				}
			}
		);
	}

	static createBtn(pair: CampaignPair) {
		this.entries.push(
			new WorkshopEntry(
				pair
			)
		);
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
		this.entries = [];
		this.insert.RemoveAndDeleteChildren();
	}
	
	static reloadList() {
		this.clearCache();
		this.deleteEntries();
		this.populate();
	}
}
