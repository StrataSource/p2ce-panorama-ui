/* eslint-disable camelcase */

'use strict';

class AutoMapEntry {
	hasMissing = false;
	addonId: AddonIndex_t;
	index: number;
	panel: RadioButton;

	constructor(pair: CampaignPair, index: number, isNew: boolean) {
		this.index = index;
		const meta = WorkshopAPI.GetAddonMeta(pair.bucket.addon_id);
		this.addonId = pair.bucket.addon_id;

		const globalCache = UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] as Map<bigint, string[]> | undefined;
		const previews = globalCache ? (globalCache.get(meta.workshopid) ?? [meta.thumb]) : [meta.thumb];
		const bgImg = previews[0];
		const isFromWorkshop = meta.workshopid !== BigInt(0);
		this.panel = FancyList_CreateEntry(AutoMapSelector.insert, {
			image: meta.thumb.length > 0 ? meta.thumb : getRandomFallbackImage(),
			bgImage: bgImg.length > 0 ? bgImg : undefined,
			title: { text: pair.campaign.title },
			mini: { text: isFromWorkshop ? '' : $.Localize('#MainMenu_Addons_Filtering_Sort_InstallSrc_Local') },
			genericIndicator: { text: $.Localize('#MainMenu_Content_Unplayed'), show: isNew },
			badIndicator: { text: $.Localize('#DependencyWarning_Header'), show: this.hasMissing },
			buttons: [
				{
					id: 'PlayAction',
					classes: ['button', 'button--green'],
					icon: 'file://{images}/play.svg',
					onactivate: () => {
						AutoMapSelector.play(`${pair.bucket.id}/${pair.campaign.id}`);
					}
				}
			],
			onactivate: () => {
				AutoMapSelector.setDetails(`${pair.bucket.id}/${pair.campaign.id}`);
			}
		}) as RadioButton;
		this.hasMissing = false;
		this.updateDependencies();
	}

	updateDependencies() {
		const deps = WorkshopAPI.GetAddonDependenciesMissing(this.addonId);
		this.hasMissing = deps !== null && deps.length > 0;
		FancyList_SetEntryProps(AutoMapSelector.insert, this.index, {
			badIndicator: { show: this.hasMissing }
		});
	}

	updateImage() {
		const meta = WorkshopAPI.GetAddonMeta(this.addonId);
		const globalCache = UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] as Map<bigint, string[]> | undefined;
		const previews = globalCache ? (globalCache.get(meta.workshopid) ?? [meta.thumb]) : [meta.thumb];
		const bgImg = previews[0];
		const img = this.panel.FindChildTraverse<Image>('BtnBgImg')!;
		img.SetImage(bgImg);
	}
}

class AutoMapSelector {
	static insert = $<Panel>('#EntryInsert')!;
	static searchBar = $<TextEntry>('#SearchBar')!;
	static campaignStrings: Array<AbstractSearchData> = [];
	static entries: Array<AutoMapEntry> = [];

	static selectedTitle = $<Label>('#SelectedTitle')!;
	static selectedAuthor = $<Label>('#SelectedAuthor')!;
	static selectedDesc = $<Label>('#SelectedDescription')!;
	static selectedSteam = $<Button>('#SelectedSteam')!;
	static selectedPlay = $<Button>('#PlayBtn')!;
	static selectedBg = $<Image>('#SelectedCoverBg')!;
	static selectedCover = $<Image>('#SelectedCover')!;
	static steamBtns = $<Panel>('#Steam')!;
	static upvoteBtn = $<RadioButton>('#UpvoteBtn')!;
	static downvoteBtn = $<RadioButton>('#DownvoteBtn')!;
	static rightPane = $<Panel>('#RightPane')!;

	static depsWrapper = $<Panel>('#DependenciesWrapper')!;
	static deps = $<Panel>('#Dependencies')!;
	static depsPanels: Map<PublishedFileId_t, { btn: Button; img: Image; loader: Panel }> = new Map();
	static depsId = 0;
	static depsIdCounter = 0;

	static init() {
		this.cacheDetails();

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Workshop'),
			$.Localize('#MainMenu_Navigation_Workshop_Tagline')
		);

		installSearchHandling<string, string>(
			this.searchBar,
			() => {
				this.hideDetails();
				this.deleteEntries();
				this.populate();
			},
			() => {},
			() => {
				return this.campaignStrings;
			},
			(matches: string[]) => {
				this.hideDetails();
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

		$.RegisterForUnhandledEvent('PanoramaComponent_Workshop_OnAddonInstalled', () => {
			for (const entry of this.entries) {
				if (entry.hasMissing) {
					entry.updateDependencies();
				}
			}
		});

		$.RegisterForUnhandledEvent('MainMenuPagePreClose', (tab: string) => {
			if (tab === 'SinglePlayer' || tab === 'StandalonePortal2MapViewer') {
				$.DispatchEvent('MainMenuHideFeaturedOverlay');
			}
		});

		installImageFallbackHandler(this.selectedCover);
		this.populate();
	}

	static createBtn(pair: CampaignPair, isNew: boolean) {
		this.entries.push(new AutoMapEntry(pair, this.entries.length, isNew));
	}

	static createBtnFromString(campaign: string) {
		const c = CampaignAPI.FindCampaign(campaign);
		if (c) {
			this.createBtn(c, false);
		} else {
			$.Warning(`Can't find '${campaign}'`);
		}
	}

	static cacheDetails() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		const items: bigint[] = [];
		let globalCache = UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] as Map<bigint, string[]> | undefined;
		if (globalCache === undefined) {
			UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] = new Map<bigint, string[]>();
			globalCache = UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] as Map<bigint, string[]>;
		}
		for (const bucket of buckets) {
			if (bucket.id.startsWith('auto_')) {
				// Search cache
				const meta = WorkshopAPI.GetAddonMeta(bucket.addon_id);
				const id = `${bucket.id}/${bucket.campaigns[0].id}`;
				this.campaignStrings.push(new AbstractSearchData(id, meta.title, id));

				// Previews cache
				if (
					bucket.addon_id !== -1 &&
					!meta.local &&
					meta.workshopid !== BigInt(0) &&
					!globalCache.has(meta.workshopid)
				) {
					items.push(meta.workshopid);
				}
			}
		}
		if (items.length > 0) {
			WorkshopAPI.CreateQueryUGCDetailsRequest(items).then((items) => {
				for (const item of items) {
					if (item === null) continue;
					globalCache.set(item.nPublishedFileId, item.previews);
				}

				for (const entry of this.entries) {
					entry.updateImage();
				}
			});
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
			// We want auto generated campaigns from map addons
			// We do NOT want auto generated campaign from P2WS (can happen if you delete
			// the addon's campaign script)
			if (bucket.id.startsWith('auto_') && !bucket.id.startsWith('auto_addon:p2ce_p2ws')) {
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

	static hideDetails() {
		this.rightPane.AddClass('hide');
		this.rightPane.style.animation = 'Portal2MapsPaneOut 0.01s ease-out 0s 1 normal forwards';
		$.DispatchEvent('MainMenuHideFeaturedOverlay');
	}

	static setDetails(id: string) {
		this.clearDeps();

		const c = CampaignAPI.FindCampaign(id);
		if (!c) {
			return;
		}

		const meta = WorkshopAPI.GetAddonMeta(c.bucket.addon_id);
		this.selectedTitle.text = c.campaign.title;
		this.selectedDesc.text = $.BBCodeToHTML(meta.description);
		this.selectedPlay.ClearPanelEvent('onactivate');
		this.selectedPlay.SetPanelEvent('onactivate', () => {
			this.play(id);
		});
		this.selectedSteam.ClearPanelEvent('onactivate');
		this.selectedSteam.SetPanelEvent('onactivate', () => {
			OpenWorkshopPageFromID(meta.workshopid);
		});

		this.selectedBg.SetImage(meta.thumb);
		this.selectedCover.SetImage(
			meta.thumb.length > 0 ? meta.thumb : 'file://{images}/menu/fallback/square_programmer_art_text.png'
		);

		if (meta.authors.length > 0) {
			this.selectedAuthor.visible = true;
			this.selectedAuthor.text = meta.authors[0];
			for (let i = 1; i < meta.authors.length; ++i) {
				this.selectedAuthor.text += `, ${meta.authors[i]}`;
			}
		} else {
			this.selectedAuthor.visible = false;
		}

		const haveDeps = WorkshopAPI.GetAddonDependencies(c.bucket.addon_id);
		const missingDeps = WorkshopAPI.GetAddonDependenciesMissing(c.bucket.addon_id);
		const hasDeps = (missingDeps !== null && missingDeps.length > 0) || (haveDeps !== null && haveDeps.length > 0);
		// Identifies this UGC details request
		// If we switch selected maps BEFORE the request finishes, we will not
		// proceed with that information, as it no longer applies!
		const requestId = this.depsIdCounter++;
		this.depsId = requestId;
		if (missingDeps && missingDeps.length > 0) {
			for (const dep of missingDeps) {
				this.addDep(`${dep}`, dep, true);
			}
			WorkshopAPI.CreateQueryUGCDetailsRequest(missingDeps)
				.then((data: Array<SteamUGCDetails_t | null>) => {
					if (requestId !== this.depsId) {
						$.Warning('Dependency information is outdated.');
						return;
					}
					for (const item of data) {
						if (item === null) continue;
						this.setDep(item.nPublishedFileId, item.previews[0]);
					}
				})
				.catch(() => {});
		}
		if (haveDeps) {
			for (const dep of haveDeps) {
				const depMeta = WorkshopAPI.GetAddonMeta(dep);
				this.addDep(`${depMeta.workshopid}`, depMeta.workshopid, false);
				this.setDep(depMeta.workshopid, depMeta.thumb);
			}
		}
		this.depsWrapper.SetHasClass('hide', !hasDeps);
		this.steamBtns.SetHasClass('hide', meta.workshopid === BigInt(0));

		// AddonRating
		switch (WorkshopAPI.GetAddonUserRating(c.bucket.addon_id)) {
			default:
			case 0:
				this.upvoteBtn.SetSelected(false);
				this.downvoteBtn.SetSelected(false);
				break;
			case 1:
				this.upvoteBtn.SetSelected(true);
				break;
			case 2:
				this.downvoteBtn.SetSelected(true);
				break;
		}
		this.upvoteBtn.ClearPanelEvent('onactivate');
		this.downvoteBtn.ClearPanelEvent('onactivate');
		this.upvoteBtn.SetPanelEvent('onactivate', () => {
			WorkshopAPI.SetAddonUserRating(c.bucket.addon_id, 1);
		});
		this.downvoteBtn.SetPanelEvent('onactivate', () => {
			WorkshopAPI.SetAddonUserRating(c.bucket.addon_id, 2);
		});

		const globalCache = UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] as Map<bigint, string[]> | undefined;
		const previews = globalCache ? (globalCache.get(meta.workshopid) ?? [meta.thumb]) : [meta.thumb];
		$.DispatchEvent('MainMenuShowFeaturedOverlay', previews[0]);

		this.rightPane.RemoveClass('hide');
		this.rightPane.style.animation = 'Portal2MapsPaneOut 0.01s linear 0s 1 normal forwards';
		this.rightPane.style.animation = 'Portal2MapsPaneIn 0.2s ease-out 0s 1 normal forwards';
	}

	static play(id: string) {
		const c = CampaignAPI.FindCampaign(id);
		if (!c) {
			$.Warning('Cannot find map to start.');
			return;
		}
		if (c.bucket.addon_id !== -1) {
			const deps = WorkshopAPI.GetAddonDependenciesMissing(c.bucket.addon_id);
			if (deps !== null && deps.length > 0) {
				$.PlaySoundEvent('UIPanorama.P2CE.MenuError');
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'dependencies',
					'file://{resources}/layout/modals/popups/addon-dependencies.xml',
					`addon=${c.bucket.addon_id}&action=0&campaignId=${id}&chapterId=${c.campaign.chapters[0].id}&map=0`
				);
			} else {
				CampaignAPI.StartCampaign(id, c.campaign.chapters[0].id, 0);
			}
		} else {
			CampaignAPI.StartCampaign(id, c.campaign.chapters[0].id, 0);
		}
	}

	static clearDeps() {
		this.depsPanels.clear();
		this.deps.RemoveAndDeleteChildren();
	}

	static addDep(id: string, workshopId: PublishedFileId_t, isMissing: boolean) {
		const b = $.CreatePanel('Button', this.deps, id, {
			class: `workshop-campaign__dep__cover${isMissing ? ' workshop-campaign__dep__cover__missing' : ''}`
		});

		b.SetPanelEvent('onactivate', () => {
			OpenWorkshopPageFromID(workshopId);
		});

		const img = $.CreatePanel('Image', b, `${id}_Image`, {
			class: 'workshop-campaign__dep__cover__image',
			scaling: 'stretch-to-cover-preserve-aspect'
		});

		const loader = $.CreatePanel('Panel', b, 'Loader');
		loader.LoadLayoutSnippet('Loader');

		this.depsPanels.set(workshopId, { btn: b, img: img, loader: loader });
	}

	static setDep(workshopId: PublishedFileId_t, previewUrl: string) {
		const panels = this.depsPanels.get(workshopId);
		if (!panels) {
			$.Warning(`Could not find panel for ${workshopId}`);
			return;
		}
		panels.img.SetImage(previewUrl);
		panels.loader.visible = false;
	}
}
