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

class Portal2Entry {
	startId: string;
	previews: string[] = [];
	exists: boolean;
	entryIndex: number;
	mapIndex: number;

	constructor(pair: CampaignPair, index: number, chapter: number, map: MapData) {
		this.entryIndex = index;
		this.mapIndex = chapter;
		this.startId = pair.campaign.chapters[chapter].id;

		const ch = pair.campaign.chapters[chapter];
		const meta = ch.meta;
		const owner = meta.get('owner') ?? '';
		const thumb = meta.get('thumbnail') ?? '';
		let ownerName = FriendsAPI.GetNameForXUID(owner);
		if (ownerName.length === 0 || ownerName === '[unknown]')
			ownerName = meta.get('owner_name') ?? '[unknown]';
		const previewsString = meta.get('previews') ?? '';
		this.previews = previewsString.split(' ');

		this.exists = map.bFileExists;

		FancyList_CreateEntry(
			Portal2MapSelector.insert,
			{
				image: thumb,
				bgImage: this.previews[0].length > 0 ? this.previews[0] : thumb,
				title: ch.title,
				subtitle: ownerName,
				mini: utcTimeConvert(Number(meta.get('subscribed'))),
				buttons: [
					{
						id: `${chapter}_Action`,
						classes: ['button--nodisable'],
						icon: 'file://{images}/download.svg'
					}
				],
				onactivate: () => {
					Portal2MapSelector.setDetailsPanel(this.entryIndex);
				}
			}
		);

		this.setExistsStatus(map.bFileExists, chapter);
		this.flashEntryBtn(map.currentOperation !== MapStatus.NONE);
		this.showThrobber(map.currentOperation !== MapStatus.NONE);
	}

	setExistsStatus(newExists: boolean, chapter: number) {
		if (newExists) {
			FancyList_SetEntryControlProps(
				Portal2MapSelector.insert,
				this.entryIndex,
				0,
				{
					removeClasses: ['button--p2-blue'],
					addClasses: ['button--green'],
					icon: 'file://{images}/play.svg',
					onactivate: () => {
						if (Portal2WorkshopAPI.IsRatingMap())
							Portal2WorkshopAPI.VotingCompleted();
						$.DispatchEvent('LoadingScreenClearLastMap');
						CampaignAPI.StartCampaign('addon:p2ce_p2ws/p2ws_sp', this.startId, 0);
					}
				}
			);
		} else {
			FancyList_SetEntryControlProps(
				Portal2MapSelector.insert,
				this.entryIndex,
				0,
				{
					removeClasses: ['button--red', 'button--green'],
					addClasses: ['button--p2-blue'],
					icon: 'file://{images}/download.svg',
					onactivate: () => {
						Portal2WorkshopAPI.DownloadMap(chapter);
						this.flashEntryBtn(true);
						this.showThrobber(true);
						if (Portal2MapSelector.portal2selected === chapter)
							Portal2MapSelector.setDetailsActionBtn(true, '[HC] Downloading...');
					}
				}
			);
		}
		this.exists = newExists;
	}

	flashEntryBtn(flash: boolean) {
		FancyList_SetEntryControlProps(
			Portal2MapSelector.insert,
			this.entryIndex,
			0,
			{
				enabled: !flash,
				conditionalClasses: [{ cls: 'workshop__entry__controls__working', cond: flash }],
				icon: 'file://{images}/download.svg'
			}
		);
	}

	showThrobber(show: boolean) {
		FancyList_ShowEntryThrobber(
			Portal2MapSelector.insert,
			this.entryIndex,
			show
		);
	}

	setUninstall() {
		Portal2MapSelector.actionBtn.RemoveClass('button--green');
		Portal2MapSelector.actionBtn.AddClass('button--red');
		Portal2MapSelector.actionImg.SetImage('file://{images}/delete.svg');
		Portal2MapSelector.actionLabel.text = '[HC] Deleting...';
		Portal2MapSelector.actionBtn.ClearPanelEvent('onactivate');
		Portal2MapSelector.deleteBtn.ClearPanelEvent('onactivate');
		FancyList_SetEntryControlProps(
			Portal2MapSelector.insert,
			this.entryIndex,
			0,
			{
				removeClasses: ['button--green'],
				addClasses: ['button--red'],
				icon: 'file://{images}/delete.svg',
				onactivate: () => {}
			}
		);
	}
}

class Portal2MapSelector {
	static insert = $<Panel>('#EntryInsert')!;
	static entries: Array<Portal2Entry> = [];
	static portal2campaign: CampaignPair | null = null;
	static portal2mapIndex = 0;
	static portal2mapAsync: uuid | undefined = undefined;
	static portal2mapCount = 0;

	static coverImg = $<Image>('#SelectedCover')!;
	static titleLabel = $<Label>('#SelectedTitle')!;
	static sizeLabel = $<Label>('#SelectedSize')!;
	static upTimeLabel = $<Label>('#SelectedUpdateTime')!;
	static subTimeLabel = $<Label>('#SelectedSubTime')!;
	static avatarImg = $<AvatarImage>('#SelectedAvatar')!;
	static authorLabel = $<Label>('#SelectedAuthor')!;
	static favBtn = $<Label>('#SelectedFavorite')!;
	static actionBtn = $<Button>('#SelectedAction')!;
	static actionImg = $<Image>('#SelectedActionImg')!;
	static actionLabel = $<Label>('#SelectedActionLabel')!;
	static deleteBtn = $<Button>('#SelectedDelete')!;
	static descLabel = $<Label>('#SelectedDescription')!;
	static steamBtn = $<Button>('#SelectedSteam')!;
	static rightPane = $<Panel>('#RightPane')!;
	static refreshBtn = $<Button>('#RefreshBtn')!;

	static portal2selected: number = -1;

	static init() {
		this.portal2campaign = null;

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Workshop'),
			$.Localize('#MainMenu_Navigation_Workshop_Tagline')
		);

		$.RegisterForUnhandledEvent('MainMenuPagePreClose', (tab: string) => {
			if (tab === 'SinglePlayer' || tab === 'StandalonePortal2MapViewer') {
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
					this.setDetailsPanel(index);
				}
			}
		);
		$.RegisterForUnhandledEvent(
			'PanoramaComponent_Portal2Workshop_OnMapsRefreshed',
			() => {
				$.Msg('Maps updated');
				this.rightPane.AddClass('hide');
				this.rightPane.style.animation = 'Portal2MapsPaneOut 0.01s ease-out 0s 1 normal forwards';
				$.DispatchEvent('MainMenuHideFeaturedOverlay');
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
		);
		this.refreshPortal2Maps();
	}

	static createPortal2Btn(chapter: number, map: MapData) {
		this.entries.push(new Portal2Entry(this.portal2campaign!, this.entries.length, chapter, map));
	}

	static populate() {
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

	static setDetailsPanel(index: number) {
		const entry = this.entries[index];
		const chapter = entry.mapIndex;
		const ch = this.portal2campaign!.campaign.chapters[chapter];
		const meta = ch.meta;
		const thumb = meta.get('thumbnail') ?? '';
		const owner = meta.get('owner') ?? '';
		let ownerName = FriendsAPI.GetNameForXUID(owner);
		if (ownerName.length === 0 || ownerName === '[unknown]')
			ownerName = meta.get('owner_name') ?? '[unknown]';

		if (entry.previews[0].length > 0)
			$.DispatchEvent('MainMenuShowFeaturedOverlay', entry.previews[0]);
		else
			$.DispatchEvent('MainMenuShowFeaturedOverlay', thumb);

		this.coverImg.SetImage(thumb);
		this.titleLabel.text = ch.title;
		const size = BigInt(meta.get('file_size') ?? '0') / BigInt(1000000);
		this.sizeLabel.text = `${size} MB`;
		this.upTimeLabel.SetTextWithDialogVariables('[HC] Last Updated on {s:time}');
		this.upTimeLabel.SetDialogVariable('time', utcTimeConvert(Number(meta.get('updated'))));
		this.subTimeLabel.SetTextWithDialogVariables('[HC] Subscribed on {s:time}');
		this.subTimeLabel.SetDialogVariable('time', utcTimeConvert(Number(meta.get('subscribed'))));
		this.avatarImg.steamid = owner;
		this.authorLabel.text = ownerName;
		this.descLabel.text = $.BBCodeToHTML(meta.get('desc') ?? '');
		const fileId = meta.get('file_id');
		this.steamBtn.SetPanelEvent('onactivate', () => {
			if (fileId) {
				SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/sharedfiles/filedetails/?id=${fileId}`);
			}
		});
		Portal2MapSelector.portal2selected = chapter;
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

		this.updateDetailsDelBtn(index);
		this.setDetailsActionBtn(curData.currentOperation !== MapStatus.NONE, btnText);
		Portal2MapSelector.doPortal2PaneAnim();
	}

	static updateDetailsDelBtn(index: number) {
		const entry = this.entries[index];
		const chapter = entry.mapIndex;
		const data = Portal2WorkshopAPI.GetMapStatus(chapter);
		this.deleteBtn.visible = data.bFileExists;
		if (data.bFileExists) {
			if (data.currentOperation === MapStatus.DELETING) {
				entry.setUninstall();
			} else {
				this.actionBtn.RemoveClass('button--p2-blue');
				this.actionBtn.AddClass('button--green');
				this.actionImg.SetImage('file://{images}/play.svg');
				this.actionLabel.text = '[HC] Play';
				this.actionBtn.ClearPanelEvent('onactivate');
				this.actionBtn.SetPanelEvent('onactivate', () => {
					if (Portal2WorkshopAPI.IsRatingMap())
						Portal2WorkshopAPI.VotingCompleted();
					$.DispatchEvent('LoadingScreenClearLastMap');
					CampaignAPI.StartCampaign('addon:p2ce_p2ws/p2ws_sp', entry.startId, 0);
				});
				this.deleteBtn.ClearPanelEvent('onactivate');
				this.deleteBtn.SetPanelEvent('onactivate', () => {
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
					this.deleteBtn.visible = false;
					entry.flashEntryBtn(true);
					entry.showThrobber(true);
					entry.setUninstall();
					this.setDetailsActionBtn(true, '[HC] Uninstalling...');
					Portal2WorkshopAPI.DeleteMap(chapter);
				});
			}
		} else {
			this.actionBtn.RemoveClass('button--red');
			this.actionBtn.RemoveClass('button--green');
			this.actionBtn.AddClass('button--p2-blue');
			this.actionImg.SetImage('file://{images}/download.svg');
			this.actionLabel.text = '[HC] Download';
			this.actionBtn.ClearPanelEvent('onactivate');
			this.actionBtn.SetPanelEvent('onactivate', () => {
				Portal2WorkshopAPI.DownloadMap(chapter);
				entry.flashEntryBtn(true);
				entry.showThrobber(true);
				this.setDetailsActionBtn(true, '[HC] Downloading...');
			});
		}
	}

	static setDetailsActionBtn(flash: boolean, text: string) {
		this.actionBtn.enabled = !flash;
		this.actionBtn.SetHasClass('workshop__entry__controls__working', flash);
		if (text.length > 0)
			this.actionLabel.text = text;
	}

	static doPortal2PaneAnim() {
		this.rightPane.RemoveClass('hide');
		this.rightPane.style.animation = 'Portal2MapsPaneOut 0.01s linear 0s 1 normal forwards';
		this.rightPane.style.animation = 'Portal2MapsPaneIn 0.2s ease-out 0s 1 normal forwards';
	}

	static deleteEntries() {
		this.entries = [];
		this.insert.RemoveAndDeleteChildren();
		if (this.portal2mapAsync) {
			$.CancelScheduled(this.portal2mapAsync);
			this.portal2mapAsync = undefined;
		}
	}

	static reloadList() {
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
		this.deleteEntries();
		this.rightPane.AddClass('hide');
		this.rightPane.style.animation = 'Portal2MapsPaneOut 0.01s ease-out 0s 1 normal forwards';
		$.CreatePanel('Panel', this.insert, 'Reloading').LoadLayoutSnippet('WorkshopReloadingSnippet');
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
