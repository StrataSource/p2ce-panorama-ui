'use strict';

class CampaignEntry {
	index: number;
	panel: Button;
	info: CampaignInfo;

	constructor(index: number, panel: Button, info: CampaignInfo) {
		this.index = index;
		this.panel = panel;
		this.info = info;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('CampaignTitle');
		const author = this.panel.FindChildTraverse<Label>('CampaignAuthor');
		const desc = this.panel.FindChildTraverse<Label>('CampaignDesc');
		const cover = this.panel.FindChildTraverse<Image>('CampaignCover');
		const ico = this.panel.FindChildTraverse<Image>('CampaignLogo');
		const btnBg = this.panel.FindChildTraverse<Image>('CampaignBtnBg');

		if (title) {
			title.text = $.Localize(this.info.title);
		}
		/*
		if (author) {
			author.text = $.Localize(this.info.author);
		}
		if (desc) {
			desc.text = $.Localize(this.info.desc);
		}
		if (cover) {
			cover.SetImage(this.info.cover);
		}
		if (ico) {
			ico.SetImage(this.info.ico);
		}
		if (btnBg) {
			btnBg.SetImage(this.info.btnBg);
		}
		*/

		this.panel.SetPanelEvent('onactivate', () => {
			$.DispatchEvent('SetActiveUiCampaign', this.info.id);
			$.DispatchEvent('MainMenuCloseAllPages');
		});
	}
}

class CampaignSelector {
	static campaignList = $<Panel>('#CampaignContainer')!;
	static hoverContainer = $<Panel>('#HoveredCampaignContainer')!;
	static hoverInfo = $<Panel>('#HoveredCampaignInfo')!;
	static hoverBoxart = $<Image>('#HoveredCampaignBoxart')!;
	static selectorPage = $<Panel>('#CampaignSelector')!;
	static campaignEntries: CampaignEntry[] = [];
	static hoveredCampaign: CampaignInfo | null = null;
	static isHidden: boolean = false;

	// campaigns, p2ce ws, p2 ws
	static gameType: GameType;
	// filters by SP or MP
	static playerMode: PlayerMode;

	static layoutReload() {
		this.purgeCampaignList();
		this.campaignList.RemoveAndDeleteChildren();
		this.populateCampaigns();
	}

	static onCampaignScreenHidden(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.hoverContainer.RemoveClass('campaigns__boxart__container__anim');
		this.hoverContainer.RemoveClass('campaigns__boxart__container__show');
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.hoverContainer.AddClass('campaigns__boxart__container__anim');
	}

	static init() {
		this.reloadList();

		$.RegisterForUnhandledEvent('LayoutReloaded', this.layoutReload.bind(this));
		
		this.hoverContainer.AddClass('campaigns__boxart__container__anim');
	
		this.gameType = UiToolkitAPI.GetGlobalObject()['GameType'] as GameType;
		this.playerMode = UiToolkitAPI.GetGlobalObject()['PlayerMode'] as PlayerMode;
		this.setPageLines();
	}

	static setPageLines() {
		const playerModeStr = this.playerMode === PlayerMode.SINGLEPLAYER ? 'Singleplayer' : 'Multiplayer';

		let headline: string;
		let tagline: string;

		switch (this.gameType) {
			case GameType.P2CE_CAMPAIGN:
				headline = tagDevString(`${playerModeStr} Campaigns`);
				tagline = tagDevString('Select a campaign to play');
				break;

			case GameType.P2CE_MAP:
				headline = tagDevString(`${playerModeStr} Maps`);
				tagline = tagDevString('Select a P2:CE Workshop map to play');
				break;

			case GameType.PORTAL2_MAP:
				headline = tagDevString(`${playerModeStr} Maps`);
				tagline = tagDevString('Select a Portal 2 Workshop map to play');
				break;

			case GameType.LOOSE_MAP:
				headline = tagDevString(`${playerModeStr} Loose Maps`);
				tagline = tagDevString('Select a disk map to play');
				break;
		
			default:
				headline = tagline = '????';
				break;
		}

		$.DispatchEvent('MainMenuSetPageLines', headline, tagline);
	}

	static populateCampaigns() {
		const campaigns = CampaignAPI.GetAllCampaigns();
		for (let i = 0; i < campaigns.length; ++i) {
			const p = $.CreatePanel('Button', this.campaignList, 'campaign' + i);
			p.LoadLayoutSnippet('CampaignEntrySnippet');

			if (i < campaigns.length - 1) {
				p.AddClass('campaigns__entry__spaced');
			}

			p.SetPanelEvent('onmouseover', () => {
				CampaignSelector.onCampaignHovered(campaigns[i]);
			});

			this.campaignEntries.push(new CampaignEntry(i, p, campaigns[i]));
			this.campaignEntries[i].update();
		}
		stripDevTagsFromLabels(this.campaignList);
	}

	static onCampaignHovered(info: CampaignInfo) {
		let switchDelay = 0;

		if (!this.hoverContainer.HasClass('campaigns__boxart__container__show')) {
			this.hoverContainer.AddClass('campaigns__boxart__container__show');

			if (info === this.hoveredCampaign) return;
		} else {
			if (info === this.hoveredCampaign) return;

			switchDelay = 0.0;

			this.hoverInfo.AddClass('campaigns__boxart__bg__switch');
			const kfs = this.hoverInfo.CreateCopyOfCSSKeyframes('FadeIn');
			this.hoverInfo.UpdateCurrentAnimationKeyframes(kfs);
		}

		this.hoveredCampaign = info;

		$.Schedule(switchDelay, () => {
			//this.hoverBoxart.SetImage(info.boxart);
		});
	}

	static purgeCampaignList() {
		while (this.campaignEntries.length > 0) this.campaignEntries.pop()?.panel.DeleteAsync(0);
	}

	static reloadList() {
		this.purgeCampaignList();
		this.populateCampaigns();
	}

	static viewLooseMaps() {
		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize('#MainMenu_Feature_Unavailable_Title'),
			$.Localize('#MainMenu_Feature_Unavailable_Description'),
			'blur',
			() => {}
		);
	}

	static openWorkshop() {
		SteamOverlayAPI.OpenURL('https://steamcommunity.com/app/440000/workshop/');
	}

	static hideBoxart() {
		// there is a specific scenario where this can be invalid
		//
		// if boxart is shown, and then the game is closed (via OS taskbar or
		// or some other way without letting the mouse leave the campaign list),
		// then the campaign list onmouseout event fires this function, but
		// the UI stuff is being deleted at this point
		if (this.hoverContainer.IsValid()) {
			this.hoverContainer.RemoveClass('campaigns__boxart__container__show');
		}
	}

	static playAwayAnim() {
		this.selectorPage.AddClass('campaigns__hide');
		this.isHidden = true;
	}

	static playReturnAnim() {
		this.selectorPage.RemoveClass('campaigns__hide');
		this.isHidden = false;
	}
}
