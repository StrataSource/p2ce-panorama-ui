'use strict';

function utcTimeConvert(time: number) {
	const currentDate = new Date();
	const date = new Date(0);
	date.setUTCSeconds(time);
	return `${date.toLocaleDateString(undefined, {
				weekday: undefined,
				month: '2-digit',
				day: '2-digit',
				// only display the year if we are in a different year
				year: currentDate.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
			})} @ ${date.toLocaleTimeString(undefined, {
				hour: '2-digit',
				minute: '2-digit',
				second: undefined
			})}`;
}

class AutoMapEntry {
	button: Button | RadioButton;
	hasMissing = false;
	// shut up i dont care
	// eslint-disable-next-line camelcase
	addonId: AddonIndex_t;
	campaignId: string;
	startId: string;
	indicatorOverlay: Panel;
	previews: string[] = [];
	exists: boolean | undefined;
	p2actionBtn: Button | undefined;
	p2actionImg: Image | undefined;
	p2throbber: Panel | undefined;

	constructor(pair: CampaignPair, isNew: boolean, chapter: number = 0, map: MapData | undefined = undefined) {
		this.button = $.CreatePanel(AutoMapSelector.isPortal2 ? 'RadioButton' : 'Button', AutoMapSelector.insert, pair.bucket.id);
		this.button.LoadLayoutSnippet('WorkshopEntrySnippet');
		this.addonId = pair.bucket.addon_id;
		this.campaignId = `${pair.bucket.id}/${pair.campaign.id}`;
		this.startId = pair.campaign.chapters[chapter].id;
		this.indicatorOverlay = this.button.FindChildTraverse<Panel>('Indicator')!;
		if (AutoMapSelector.isPortal2)
			this.setupPortal2(pair, chapter, map!);
		else
			this.setupStandard(pair, isNew, chapter);
	}

	setupStandard(pair: CampaignPair, isNew: boolean, chapter: number = 0) {
		this.button.SetDialogVariable('name', pair.campaign.title);

		const img = this.button.FindChildTraverse<Image>('Cover')!;
		installImageFallbackHandler(img);
		const meta = WorkshopAPI.GetAddonMeta(pair.bucket.addon_id);
		img.SetImage(meta.thumb);

		this.hasMissing = false;

		this.updateDependencies();
		this.button.SetPanelEvent('onactivate', () => {
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'flyout',
				'file://{resources}/layout/modals/flyouts/workshop-campaign.xml',
				`addon=${this.addonId}&campaign=${pair.bucket.id}/${pair.campaign.id}&chapter=${pair.campaign.chapters[chapter].id}`
			);
		});

		const indicator = this.button.FindChildTraverse<Panel>('NewIndicator')!;
		indicator.SetHasClass('hide', !isNew);
	}

	setupPortal2(pair: CampaignPair, chapter: number, map: MapData) {
		const ch = pair.campaign.chapters[chapter];
		const meta = ch.meta;
		const owner = meta.get('owner') ?? '';
		const thumb = meta.get('thumbnail') ?? '';
		let ownerName = FriendsAPI.GetNameForXUID(owner);
		if (ownerName.length === 0 || ownerName === '[unknown]')
			ownerName = meta.get('owner_name') ?? '[unknown]';
		const previewsString = meta.get('previews') ?? '';
		this.previews = previewsString.split(' ');

		const btnBgPanel = this.button.FindChildTraverse<Image>('BtnBgImg')!;
		if (this.previews[0].length > 0)
			btnBgPanel.SetImage(this.previews[0]);
		else
			btnBgPanel.SetImage(thumb);

		this.button.SetDialogVariable('name', ch.title);
		this.button.SetDialogVariable('author', ownerName);
		this.button.SetDialogVariable('time', utcTimeConvert(Number(meta.get('subscribed'))));
		const img = this.button.FindChildTraverse<Image>('Cover')!;
		installImageFallbackHandler(img);
		img.SetImage(thumb);

		this.hasMissing = false;

		this.button.SetPanelEvent('onactivate', () => {
			if (this.previews[0].length > 0)
				$.DispatchEvent('MainMenuShowFeaturedOverlay', this.previews[0]);
			else {
				$.DispatchEvent('MainMenuShowFeaturedOverlay', thumb);
			}

			AutoMapSelector.portal2panels.coverImg.SetImage( thumb );
			AutoMapSelector.portal2panels.titleLabel.text = ch.title;
			const size = BigInt(meta.get('file_size') ?? '0') / BigInt(1000000);
			AutoMapSelector.portal2panels.sizeLabel.text = `~${size} MB`;
			AutoMapSelector.portal2panels.upTimeLabel.SetTextWithDialogVariables('[HC] Last Updated on {s:time}');
			AutoMapSelector.portal2panels.upTimeLabel.SetDialogVariable('time', utcTimeConvert(Number(meta.get('updated'))));
			AutoMapSelector.portal2panels.subTimeLabel.SetTextWithDialogVariables('[HC] Subscribed on {s:time}');
			AutoMapSelector.portal2panels.subTimeLabel.SetDialogVariable('time', utcTimeConvert(Number(meta.get('subscribed'))));
			AutoMapSelector.portal2panels.avatarImg.steamid = owner;
			AutoMapSelector.portal2panels.authorLabel.text = ownerName;
			AutoMapSelector.portal2panels.descLabel.text = $.BBCodeToHTML(meta.get('desc') ?? '');
			const fileId = meta.get('file_id');
			AutoMapSelector.portal2panels.steamBtn.SetPanelEvent('onactivate', () => {
				if (fileId) {
					SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/sharedfiles/filedetails/?id=${fileId}`);
				}
			});
			AutoMapSelector.portal2selected = chapter;
			const curData = Portal2WorkshopAPI.GetMapStatus(chapter);
			let btnText = '';
			switch (curData.currentOperation) {
				default:
					break;

				case MapStatus.DOWNLOADING:
					btnText = '[HC] Downloading...';
					break;

				case MapStatus.DELETING:
					btnText = '[HC] Uninstalling...';
					break;
			}
			this.setSelectedExistsStatus(chapter);
			this.flashSelectedBtn(curData.currentOperation !== MapStatus.NONE, btnText);
			AutoMapSelector.doPortal2PaneAnim();
		});

		this.p2actionBtn = this.button.FindChildTraverse('ActionBtn')!;
		this.p2actionImg = this.p2actionBtn.FindChild<Image>('ActionImg')!;
		this.p2throbber = this.button.FindChildTraverse('Throbber')!;
		this.exists = map.bFileExists;
		this.setExistsStatus(map.bFileExists, chapter);

		this.startId = ch.id;

		this.flashEntryBtn(map.currentOperation !== MapStatus.NONE);
		this.showThrobber(map.currentOperation !== MapStatus.NONE);
	}

	setExistsStatus(newExists: boolean, chapter: number) {
		if (newExists) {
			this.p2actionBtn!.RemoveClass('button--p2-blue');
			this.p2actionBtn!.AddClass('button--green');
			this.p2actionImg!.SetImage('file://{images}/play.svg');
			this.p2actionBtn!.ClearPanelEvent('onactivate');
			this.p2actionBtn!.SetPanelEvent('onactivate', () => {
				if (Portal2WorkshopAPI.IsRatingMap())
					Portal2WorkshopAPI.VotingCompleted();
				$.DispatchEvent('LoadingScreenClearLastMap');
				CampaignAPI.StartCampaign(this.campaignId, this.startId, 0);
			});
		} else {
			this.p2actionBtn!.RemoveClass('button--red');
			this.p2actionBtn!.RemoveClass('button--green');
			this.p2actionBtn!.AddClass('button--p2-blue');
			this.p2actionImg!.SetImage('file://{images}/download.svg');
			this.p2actionBtn!.ClearPanelEvent('onactivate');
			this.p2actionBtn!.SetPanelEvent('onactivate', () => {
				Portal2WorkshopAPI.DownloadMap(chapter);
				this.flashEntryBtn(true);
				this.showThrobber(true);
				if (AutoMapSelector.portal2selected === chapter)
					this.flashSelectedBtn(true, '[HC] Downloading...');
			});
		}
		this.exists = newExists;
	}

	setSelectedExistsStatus(chapter: number) {
		AutoMapSelector.portal2panels.deleteBtn.visible = this.exists!;
		if (this.exists) {
			if (Portal2WorkshopAPI.GetMapStatus(chapter).currentOperation === MapStatus.DELETING) {
				this.setUninstall();
			} else {
				AutoMapSelector.portal2panels.actionBtn.RemoveClass('button--p2-blue');
				AutoMapSelector.portal2panels.actionBtn.AddClass('button--green');
				AutoMapSelector.portal2panels.actionImg.SetImage('file://{images}/play.svg');
				AutoMapSelector.portal2panels.actionLabel.text = '[HC] Play';
				AutoMapSelector.portal2panels.actionBtn.ClearPanelEvent('onactivate');
				AutoMapSelector.portal2panels.actionBtn.SetPanelEvent('onactivate', () => {
					if (Portal2WorkshopAPI.IsRatingMap())
						Portal2WorkshopAPI.VotingCompleted();
					$.DispatchEvent('LoadingScreenClearLastMap');
					CampaignAPI.StartCampaign(this.campaignId, this.startId, 0);
				});
				AutoMapSelector.portal2panels.deleteBtn.ClearPanelEvent('onactivate');
				AutoMapSelector.portal2panels.deleteBtn.SetPanelEvent('onactivate', () => {
					const curMap = GameInterfaceAPI.GetCurrentMap();
					const selMapData = Portal2WorkshopAPI.GetMapStatus(chapter);
					if (curMap && selMapData.filename === curMap ) {
						UiToolkitAPI.ShowGenericPopup(
							'[HC] Action Forbidden',
							'[HC] This test chamber cannot be deleted because you are currently playing on it. Change levels or return to the main menu to do this.',
							'bad-popup'
						);
						return;
					}
					AutoMapSelector.portal2panels.deleteBtn.visible = false;
					this.flashEntryBtn(true);
					this.showThrobber(true);
					this.flashSelectedBtn(true, '[HC] Uninstalling...');
					this.setUninstall();
					Portal2WorkshopAPI.DeleteMap(chapter);
				});
			}
		} else {
			AutoMapSelector.portal2panels.actionBtn.RemoveClass('button--red');
			AutoMapSelector.portal2panels.actionBtn.RemoveClass('button--green');
			AutoMapSelector.portal2panels.actionBtn.AddClass('button--p2-blue');
			AutoMapSelector.portal2panels.actionImg.SetImage('file://{images}/download.svg');
			AutoMapSelector.portal2panels.actionLabel.text = '[HC] Download';
			AutoMapSelector.portal2panels.actionBtn.ClearPanelEvent('onactivate');
			AutoMapSelector.portal2panels.actionBtn.SetPanelEvent('onactivate', () => {
				Portal2WorkshopAPI.DownloadMap(chapter);
				this.flashEntryBtn(true);
				this.showThrobber(true);
				this.flashSelectedBtn(true, '[HC] Downloading...');
			});
		}
	}

	flashEntryBtn(flash: boolean) {
		this.p2actionBtn!.enabled = !flash;
		this.p2actionBtn!.SetHasClass('workshop__entry__controls__working', flash);
	}

	// eslint-disable-next-line class-methods-use-this
	flashSelectedBtn(flash: boolean, text: string) {
		AutoMapSelector.portal2panels.actionBtn.enabled = !flash;
		AutoMapSelector.portal2panels.actionBtn.SetHasClass('workshop__entry__controls__working', flash);
		if (text.length > 0)
			AutoMapSelector.portal2panels.actionLabel.text = text;
	}

	showThrobber(show: boolean) {
		this.p2throbber!.SetHasClass('hide', !show);
	}

	setUninstall() {
		AutoMapSelector.portal2panels.actionBtn.RemoveClass('button--green');
		AutoMapSelector.portal2panels.actionBtn.AddClass('button--red');
		AutoMapSelector.portal2panels.actionImg.SetImage('file://{images}/delete.svg');
		AutoMapSelector.portal2panels.actionLabel.text = '[HC] Deleting...';
		AutoMapSelector.portal2panels.actionBtn.ClearPanelEvent('onactivate');
		AutoMapSelector.portal2panels.deleteBtn.ClearPanelEvent('onactivate');
		this.p2actionBtn!.RemoveClass('button--green');
		this.p2actionBtn!.AddClass('button--red');
		this.p2actionImg!.SetImage('file://{images}/delete.svg');
		this.p2actionBtn!.ClearPanelEvent('onactivate');
	}

	updateDependencies() {
		const deps = WorkshopAPI.GetAddonDependenciesMissing(this.addonId);
		this.hasMissing = deps !== null && deps.length > 0;
		this.indicatorOverlay.SetHasClass('hide', !this.hasMissing);
	}
}

class AutoMapSelector {
	static insert = $<Panel>('#EntryInsert')!;
	static searchBar = $<TextEntry>('#SearchBar')!;
	static campaignStrings: Array<AbstractSearchData> = [];
	static entries: Array<AutoMapEntry> = [];
	static isPortal2 = false;
	static portal2campaign: CampaignPair | null = null;
	static portal2mapIndex = 0;
	static portal2mapAsync: uuid | undefined = undefined;
	static portal2mapCount = 0;
	static portal2panels = {
		coverImg: $<Image>('#SelectedCover')!,
		titleLabel: $<Label>('#SelectedTitle')!,
		sizeLabel: $<Label>('#SelectedSize')!,
		upTimeLabel: $<Label>('#SelectedUpdateTime')!,
		subTimeLabel: $<Label>('#SelectedSubTime')!,
		avatarImg: $<AvatarImage>('#SelectedAvatar')!,
		authorLabel: $<Label>('#SelectedAuthor')!,
		favBtn: $<Label>('#SelectedFavorite')!,
		actionBtn: $<Button>('#SelectedAction')!,
		actionImg: $<Image>('#SelectedActionImg')!,
		actionLabel: $<Label>('#SelectedActionLabel')!,
		deleteBtn: $<Button>('#SelectedDelete')!,
		descLabel: $<Label>('#SelectedDescription')!,
		steamBtn: $<Button>('#SelectedSteam')!,
		rightPane: $<Panel>('#RightPane')!,
		refreshBtn: $<Button>('#RefreshBtn')!,
	};
	static portal2selected: number = -1;

	static init() {
		this.portal2campaign = null;
		this.isPortal2 = $.GetContextPanel().GetAttributeInt( 'useportal2', 0 ) === 1;
		this.cacheSearch();

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

		if (this.isPortal2) {
			$.RegisterForUnhandledEvent('MainMenuPagePreClose', (tab: string) => {
				if (tab === 'SinglePlayer' || tab === 'StandalonePortal2MapViewer') {
					if (!Portal2WorkshopAPI.IsRatingMap())
						$.DispatchEvent('MainMenuHideFeaturedOverlay');
					if (this.portal2mapAsync)
						$.CancelScheduled(this.portal2mapAsync);
				}
			});
			$.RegisterForUnhandledEvent(
				'PanoramaComponent_Portal2Workshop_OnMapActionCompleted',
				(index: number, map: MapData) => {
					if (index >= this.entries.length) {
						$.Warning('Action complete index is out of bounds!');
						return;
					}
					$.Msg(`Map ${index} status updated.`);
					const entry = this.entries[index];
					entry.setExistsStatus(map.bFileExists, index);
					entry.flashEntryBtn(false);
					entry.showThrobber(false);
					if (index === this.portal2selected) {
						entry.flashSelectedBtn(false, '');
						entry.setSelectedExistsStatus(index);
					}
				}
			);
			$.RegisterForUnhandledEvent(
				'PanoramaComponent_Portal2Workshop_OnMapsRefreshed',
				() => {
					$.Msg('Maps updated');
					this.reloadList();
				}
			);
			$.RegisterForUnhandledEvent(
				'PanoramaComponent_Portal2Workshop_OnAsyncActionFailed',
				(reasonLoc: string) => {
					UiToolkitAPI.ShowGenericPopup(
						'[HC] Action Failed',
						`[HC] An error occurred while processing your last request:\n${$.Localize(reasonLoc)}`,
						'bad-popup'
					);
				}
			);
			$.RegisterForUnhandledEvent(
				'PanoramaComponent_Portal2Workshop_OnRefreshStarted',
				() => {
					this.refreshStarted();
				}
			)
		} else {
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
		}

		this.populate();
	}

	static createBtn(pair: CampaignPair, isNew: boolean) {
		this.entries.push(new AutoMapEntry(pair, isNew));
	}

	static createPortal2Btn(chapter: number, map: MapData) {
		this.entries.push(new AutoMapEntry(this.portal2campaign!, false, chapter, map));
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

	static populateAutomaps() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		const newItems: Array<CampaignPair> = [];
		const otherItems: Array<CampaignPair> = [];

		if (buckets.filter((v) => v.id.startsWith('auto_')).length === 0) {
			const p = $.CreatePanel('Panel', this.insert, 'None');
			p.LoadLayoutSnippet('WorkshopNoneSnippet');
			return;
		}

		for (const bucket of buckets) {
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

	static populatePortal2() {
		const p = CampaignAPI.FindCampaign('addon:p2ce_p2ws/p2ws_sp');
		if (!p)
			return;

		this.portal2campaign = p;
		this.portal2mapIndex = 0;
		this.portal2mapCount = Portal2WorkshopAPI.GetNumMaps();

		this.portal2mapAsync = $.Schedule(0.1, this.createNextPortal2Btn.bind(this));
	}

	static createNextPortal2Btn() {
		if (this.portal2mapIndex >= this.portal2mapCount) {
			this.portal2mapAsync = undefined;
			return;
		}
		const data = Portal2WorkshopAPI.GetMapStatus(this.portal2mapIndex);
		this.createPortal2Btn(this.portal2mapIndex, data);
		++this.portal2mapIndex;
		this.portal2mapAsync = $.Schedule(0.01, this.createNextPortal2Btn.bind(this));
	}

	static doPortal2PaneAnim() {
		this.portal2panels.rightPane.RemoveClass('hide');
		this.portal2panels.rightPane.style.animation = 'Portal2MapsPaneOut 0.01s linear 0s 1 normal forwards';
		this.portal2panels.rightPane.style.animation = 'Portal2MapsPaneIn 0.2s ease-out 0s 1 normal forwards';
	}

	static populate() {
		if (this.isPortal2)
			this.populatePortal2();
		else
			this.populateAutomaps();
	}

	static clearCache() {
		this.campaignStrings = [];
	}

	static deleteEntries() {
		this.entries = [];
		this.insert.RemoveAndDeleteChildren();
		if (this.isPortal2 && this.portal2mapAsync) {
			$.CancelScheduled(this.portal2mapAsync);
			this.portal2mapAsync = undefined;
		}
	}

	static reloadList() {
		this.clearCache();
		this.deleteEntries();
		this.populate();
	}

	static refreshPortal2Maps() {
		Portal2WorkshopAPI.ReloadMaps();
	}

	static refreshStarted() {
		if (this.portal2mapAsync) {
			$.CancelScheduled(this.portal2mapAsync);
			this.portal2mapAsync = undefined;
		}
		this.clearCache();
		this.deleteEntries();
		this.portal2panels.rightPane.AddClass('hide');
		this.portal2panels.rightPane.style.animation = 'Portal2MapsPaneOut 0.01s ease-out 0s 1 normal forwards';
		const p = $.CreatePanel('Panel', this.insert, 'Reloading');
		p.LoadLayoutSnippet('WorkshopReloadingSnippet');
	}

	static showInfoBox() {
		UiToolkitAPI.ShowGenericPopupOk(
			'[HC] P2WS',
			'[HC] Searching and filtering is not available. Favoriting and unsubscribing from the UI is not available. This system is currently Windows only.',
			'generic-popup generic-popup--large',
			() => {}
		);
	}

	static openPortal2Workshop() {
		SteamOverlayAPI.OpenURLModal('https://steamcommunity.com/app/620/workshop/');
	}
}
