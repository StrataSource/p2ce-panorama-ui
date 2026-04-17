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

	constructor(pair: CampaignPair, isNew: boolean) {
		this.button = $.CreatePanel('Button', WorkshopSelector.insert, pair.bucket.id);

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
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'flyout',
				'file://{resources}/layout/modals/flyouts/workshop-campaign.xml',
				`addon=${this.addonId}&campaign=${pair.bucket.id}/${pair.campaign.id}&chapter=${pair.campaign.chapters[0].id}`
			);
		});

		const indicator = this.button.FindChildTraverse<Panel>('NewIndicator')!;
		indicator.SetHasClass('hide', !isNew);
	}

	updateDependencies() {
		const deps = WorkshopAPI.GetAddonDependenciesMissing(this.addonId);
		this.hasMissing = deps !== null && deps.length > 0;
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

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Workshop'),
			$.Localize('#MainMenu_Navigation_Workshop_Tagline')
		);

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
		$.RegisterForUnhandledEvent('PanoramaComponent_Workshop_OnAddonInstalled', () => {
			for (const entry of this.entries) {
				if (entry.hasMissing) {
					entry.updateDependencies();
				}
			}
		});
	}

	static createBtn(pair: CampaignPair, isNew: boolean) {
		this.entries.push(new WorkshopEntry(pair, isNew));
	}

	static createBtnFromString(campaign: string) {
		const c = CampaignAPI.FindCampaign(campaign);
		if (c) {
			this.createBtn(c, false);
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
				this.campaignStrings.push(new AbstractSearchData(id, meta.title, id));
			}
		}
	}

	static populate() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		const newItems: Array<CampaignPair> = [];
		const otherItems: Array<CampaignPair> = [];

		if (buckets.filter((v) => v.id.startsWith('auto_')).length === 0) {
			const p = $.CreatePanel('Panel', this.insert, 'None');
			p.LoadLayoutSnippet('WorkshopNoneSnippet');
			return;
		}

		for (const bucket of buckets) {
			if (bucket.id.startsWith('auto_')) {
				const array = CampaignAPI.CampaignHasSaveData(`${bucket.id}/${bucket.campaigns[0].id}`)
					? otherItems
					: newItems;
				array.push({ bucket: bucket, campaign: bucket.campaigns[0] });
			}
		}

		const makeBtns = (array: Array<CampaignPair>, isNew: boolean) => {
			for (const item of array) {
				this.createBtn(item, isNew);
			}
		};

		makeBtns(newItems, true);
		makeBtns(otherItems, false);
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
