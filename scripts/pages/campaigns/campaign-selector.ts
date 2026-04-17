'use strict';

class CampaignEntry {
	panel: Button;
	info: CampaignPair;
	hasSaveData: boolean;
	boxartPath: string | undefined;
	coverPath: string | undefined;
	iconPath: string | undefined;
	btnBgPath: string | undefined;
	desc: string | undefined;
	author: string | undefined;

	constructor(
		panel: Button,
		info: CampaignPair,
		hasSaveData: boolean,
		boxart: string | undefined,
		cover: string | undefined,
		btnBg: string | undefined,
		desc: string | undefined,
		author: string | undefined
	) {
		this.panel = panel;
		this.info = info;
		this.hasSaveData = hasSaveData;
		this.boxartPath = boxart;
		this.coverPath = cover;
		this.btnBgPath = btnBg;
		this.desc = desc;
		this.author = author;

		this.update();
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('CampaignTitle');
		const author = this.panel.FindChildTraverse<Label>('CampaignAuthor');
		const desc = this.panel.FindChildTraverse<Label>('CampaignDesc');
		const cover = this.panel.FindChildTraverse<Image>('CampaignCover');
		const btnBg = this.panel.FindChildTraverse<Image>('CampaignBtnBg');

		const basePath = getCampaignAssetPath(this.info);

		const newIndicator = this.panel.FindChildTraverse<Panel>('NewIndicator')!;
		newIndicator.SetHasClass('hide', this.hasSaveData);

		const missingIndicator = this.panel.FindChildTraverse<Panel>('MissingIndicator')!;
		const missing = WorkshopAPI.GetAddonDependenciesMissing(this.info.bucket.addon_id);
		missingIndicator.SetHasClass('hide', !(missing !== null && missing.length > 0));

		if (title) {
			title.text = $.Localize(this.info.campaign.title);
		}
		if (author) {
			if (this.author) author.text = $.Localize(this.author);
			else author.visible = false;
		}
		if (desc) {
			if (this.desc) desc.text = $.Localize(this.desc);
			else desc.visible = false;
		}
		if (cover) {
			installImageFallbackHandler(cover);
			if (this.coverPath) cover.SetImage(`${basePath}${this.coverPath}`);
			else cover.SetImage(getRandomFallbackImage());
		}
		if (btnBg) {
			if (this.btnBgPath) btnBg.SetImage(`${basePath}${this.btnBgPath}`);
			else btnBg.visible = false;
		}

		this.panel.SetPanelEvent('onactivate', () => {
			const deps = WorkshopAPI.GetAddonDependenciesMissing(this.info.bucket.addon_id);
			const campaign = `${this.info.bucket.id}/${this.info.campaign.id}`;
			if (deps && deps.length > 0) {
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'dependencies',
					'file://{resources}/layout/modals/popups/addon-dependencies.xml',
					`addon=${this.info.bucket.addon_id}&action=1&campaign=${campaign}`
				);
			} else {
				$.DispatchEvent('MainMenuAnimatedSwitch', campaign);
				$.DispatchEvent('MainMenuCloseAllPages');
			}
		});
		this.panel.SetPanelEvent('onmouseover', () => {
			CampaignSelector.onCampaignHovered(this);
		});
		this.panel.SetPanelEvent('onfocus', () => {
			CampaignSelector.onCampaignHovered(this);
		});
	}
}

class CampaignSelector {
	static searchBar = $<TextEntry>('#SearchBar')!;
	static campaignList = $<Panel>('#CampaignContainer')!;
	static hoverContainer = $<Panel>('#HoveredCampaignContainer')!;
	static hoverInfo = $<Panel>('#HoveredCampaignInfo')!;
	static hoverBoxart = $<Image>('#HoveredCampaignBoxart')!;

	static campaignEntries: CampaignEntry[] = [];
	static hoveredCampaign: CampaignInfo | null = null;
	static searchableCampaigns: Array<AbstractSearchData> = [];

	static init() {
		this.hoverContainer.AddClass('campaigns__boxart__container__anim');

		installImageFallbackHandler(this.hoverBoxart);

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Campaign'),
			$.Localize('#MainMenu_Navigation_Campaign_Tagline')
		);

		this.reloadList();

		const buckets = CampaignAPI.GetAllCampaignBuckets();
		for (const bucket of buckets) {
			// don't search special ws
			if (isBucketSingleWsCampaign(bucket)) continue;

			for (const campaign of bucket.campaigns) {
				const campaignId = `${bucket.id}/${campaign.id}`;
				const campaignMeta = CampaignAPI.GetCampaignMeta(campaignId);
				if (!campaignMeta) continue;
				const author = campaignMeta.get(CampaignMeta.AUTHOR);
				this.searchableCampaigns.push(
					new AbstractSearchData(
						// don't attach the campaign data, might be expensive!
						campaignId,
						`${$.Localize(campaign.title)}${author ? ` ${$.Localize(author)}` : ''}`,
						campaignId
					)
				);
			}
		}

		this.searchableCampaigns.sort((a, b) => a.text.localeCompare(b.text));

		installSearchHandling<string, string>(
			this.searchBar,
			() => {
				this.reloadList();
			},
			() => {},
			() => {
				// don't want to reconstruct this every time!
				return this.searchableCampaigns;
			},
			// matching against campaign IDs directly
			(matches: Array<string>) => {
				this.clearCampaigns();
				for (const id of matches) {
					const data = CampaignAPI.FindCampaign(id);
					if (!data) {
						$.Warning(`Found a match for '${id}', but the data is not accessible!!`);
						continue;
					}
					// dont show indicator on searches
					this.createCampaignBtn(data.bucket, data.campaign, true);
				}
			}
		);

		if (this.campaignEntries.length > 0) {
			this.campaignEntries[0].panel.SetFocus();
		}

		$.RegisterForUnhandledEvent('PanoramaComponent_Campaign_OnRefreshList', () => {
			$.Msg('New campaigns!');
			this.searchBar.text = '';
			this.reloadList();
		});
	}

	static createCampaignBtn(bucket: CampaignBucket, campaign: CampaignInfo, hasSaveData: boolean) {
		const p = $.CreatePanel('Button', this.campaignList, `Campaign_${bucket.id}-${campaign.id}`);
		p.LoadLayoutSnippet('CampaignEntrySnippet');
		p.AddClass('campaigns__entry__spaced');

		const m = CampaignAPI.GetCampaignMeta(`${bucket.id}/${campaign.id}`) ?? new Map<string, string>();
		if (m.size === 0) {
			$.Warning(`Campaign meta map for '${bucket.id}/${campaign.id}' couldn't be retrieved, or it was empty.`);
		}

		this.campaignEntries.push(
			new CampaignEntry(
				p,
				{ bucket: bucket, campaign: campaign },
				hasSaveData,
				m.get(CampaignMeta.BOX_ART),
				m.get(CampaignMeta.COVER),
				m.get(CampaignMeta.BTN_BG),
				m.get(CampaignMeta.DESC),
				m.get(CampaignMeta.AUTHOR)
			)
		);
	}

	static clearCampaigns() {
		this.campaignList.RemoveAndDeleteChildren();
		this.campaignEntries = [];
		this.hoveredCampaign = null;
	}

	static populateCampaigns() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		/*
		const baseCampaigns: Array<CampaignPair> = [];
		const localCampaigns: Array<CampaignPair> = [];
		const workshopCampaigns: Array<CampaignPair> = [];

		for (const pair of buckets) {
			const addToArray = (array: Array<CampaignPair>) => {
				for (const campaign of pair.campaigns) {
					array.push({bucket: pair, campaign: campaign});
				}
			}
			if (pair.id === 'base') {
				addToArray(baseCampaigns);
			} else if (pair.id.startsWith('addon')) {
				addToArray(localCampaigns);
			} else if (pair.id.startsWith('workshop')) {
				addToArray(workshopCampaigns);
			}
		}

		const sortArray = (newItems: Array<CampaignPair>, oldItems: Array<CampaignPair>, array: Array<CampaignPair>) => {
			array.forEach((v, i) => {
				if (!CampaignAPI.CampaignHasSaveData(`${v.bucket.id}/${v.campaign.id}`)) {
					newItems.push(v);
				} else {
					oldItems.push(v);
				}
			});

			const condition = (a: CampaignPair, b: CampaignPair) => $.Localize(a.campaign.title).localeCompare($.Localize(b.campaign.title));

			newItems.sort(condition);
			oldItems.sort(condition);
		};

		const newBaseCampaigns: Array<CampaignPair> = [];
		const oldBaseCampaigns: Array<CampaignPair> = [];
		const newLocalCampaigns: Array<CampaignPair> = [];
		const oldLocalCampaigns: Array<CampaignPair> = [];
		const newWorkshopCampaigns: Array<CampaignPair> = [];
		const oldWorkshopCampaigns: Array<CampaignPair> = [];

		sortArray(newBaseCampaigns, oldBaseCampaigns, baseCampaigns);
		sortArray(newLocalCampaigns, oldLocalCampaigns, localCampaigns);
		sortArray(newWorkshopCampaigns, oldWorkshopCampaigns, workshopCampaigns);

		const allNewCampaigns: Array<CampaignPair> = newBaseCampaigns.concat(newLocalCampaigns, newWorkshopCampaigns);
		const allOtherCampaigns: Array<CampaignPair> = oldBaseCampaigns.concat(oldLocalCampaigns, oldWorkshopCampaigns);
		*/

		if (buckets.filter((v) => !v.id.startsWith('auto_')).length === 0) {
			const p = $.CreatePanel('Panel', this.campaignList, 'None');
			p.LoadLayoutSnippet('CampaignNoneSnippet');
			return;
		}

		const doAddButtons = (array: Array<CampaignPair>, hasSaveData: boolean) => {
			for (const pair of array) {
				this.createCampaignBtn(pair.bucket, pair.campaign, hasSaveData);
			}
		};

		const allNewCampaigns: Array<CampaignPair> = [];
		const allOtherCampaigns: Array<CampaignPair> = [];

		for (const bucket of buckets) {
			if (bucket.id.startsWith('auto_')) {
				continue;
			}
			for (const campaign of bucket.campaigns) {
				const array = CampaignAPI.CampaignHasSaveData(`${bucket.id}/${campaign.id}`)
					? allOtherCampaigns
					: allNewCampaigns;
				array.push({ bucket: bucket, campaign: campaign });
			}
		}

		doAddButtons(allNewCampaigns, false);
		doAddButtons(allOtherCampaigns, true);

		stripDevTagsFromLabels(this.campaignList);
	}

	static onCampaignHovered(e: CampaignEntry) {
		if (!e) {
			$.Warning('Dont do that');
			return;
		}

		let switchDelay = 0;

		if (this.hoverContainer.IsValid() && !this.hoverContainer.HasClass('campaigns__boxart__container__show')) {
			this.hoverContainer.AddClass('campaigns__boxart__container__show');

			if (e.info.campaign === this.hoveredCampaign) return;
		} else {
			if (e.info.campaign === this.hoveredCampaign) return;

			switchDelay = 0.0;

			if (this.hoverContainer.IsValid()) {
				this.hoverInfo.AddClass('campaigns__boxart__bg__switch');
				const kfs = this.hoverInfo.CreateCopyOfCSSKeyframes('FadeIn');
				this.hoverInfo.UpdateCurrentAnimationKeyframes(kfs);
			}
		}

		this.hoveredCampaign = e.info.campaign;

		$.Schedule(switchDelay, () => {
			const basePath = getCampaignAssetPath(e.info);
			if (e.boxartPath) this.hoverBoxart.SetImage(`${basePath}${e.boxartPath}`);
			else this.hoverBoxart.SetImage(getRandomFallbackImage());
		});
	}

	static reloadList() {
		this.clearCampaigns();
		this.populateCampaigns();
	}

	static hideBoxart() {
		if (this.hoverContainer.IsValid()) {
			this.hoverContainer.RemoveClass('campaigns__boxart__container__show');
		}
	}
}
