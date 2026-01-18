'use strict';

class CampaignEntry {
	index: number;
	panel: Button;
	info: CampaignInfo;
	boxartPath: string | undefined;
	coverPath: string | undefined;
	iconPath: string | undefined;
	btnBgPath: string | undefined;
	desc: string | undefined;
	author: string | undefined;

	constructor(
		index: number,
		panel: Button,
		info: CampaignInfo,
		boxart: string | undefined,
		cover: string | undefined,
		icon: string | undefined,
		btnBg: string | undefined,
		desc: string | undefined,
		author: string | undefined
	) {
		this.index = index;
		this.panel = panel;
		this.info = info;
		this.boxartPath = boxart;
		this.coverPath = cover;
		this.iconPath = icon;
		this.btnBgPath = btnBg;
		this.desc = desc;
		this.author = author;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('CampaignTitle');
		const author = this.panel.FindChildTraverse<Label>('CampaignAuthor');
		const desc = this.panel.FindChildTraverse<Label>('CampaignDesc');
		const cover = this.panel.FindChildTraverse<Image>('CampaignCover');
		const ico = this.panel.FindChildTraverse<Image>('CampaignLogo');
		const btnBg = this.panel.FindChildTraverse<Image>('CampaignBtnBg');

		// eject out into the action bar
		if (this.index === 0) {
			this.panel.SetPanelEvent('onmoveup', () => {
				CampaignSelector.focusActionBar();
			});
		}

		if (title) {
			title.text = $.Localize(this.info.title);
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
			if (this.coverPath) cover.SetImage(`file://${this.coverPath}`);
			else cover.SetImage(getRandomFallbackImage());
		}
		if (ico) {
			if (this.iconPath) ico.SetImage(`file://${this.iconPath}`);
			else ico.visible = false;
		}
		if (btnBg) {
			if (this.btnBgPath) btnBg.SetImage(`file://${this.btnBgPath}`);
			else btnBg.visible = false;
		}

		this.panel.SetPanelEvent('onactivate', () => {
			$.DispatchEvent('MainMenuAnimatedSwitch', this.info.id);
			$.DispatchEvent('MainMenuSwitchFade', false, true);
			$.DispatchEvent('MainMenuCloseAllPages');
		});
	}
}

class CampaignSelector {
	static campaignList = $<Panel>('#CampaignContainer')!;
	static hoverContainer = $<Panel>('#HoveredCampaignContainer')!;
	static hoverInfo = $<Panel>('#HoveredCampaignInfo')!;
	static hoverBoxart = $<Image>('#HoveredCampaignBoxart')!;
	static campaignEntries: CampaignEntry[] = [];
	static hoveredCampaign: CampaignInfo | null = null;

	// campaigns, p2ce ws, p2 ws
	static gameType: GameType;
	// filters by SP or MP
	static playerMode: PlayerMode;

	static focusActionBar() {
		$('#SearchBar')!.SetFocus();
	}

	static init() {
		this.hoverContainer.AddClass('campaigns__boxart__container__anim');

		this.gameType = UiToolkitAPI.GetGlobalObject()['GameType'] as GameType;
		this.playerMode = UiToolkitAPI.GetGlobalObject()['PlayerMode'] as PlayerMode;
		this.setPageLines();
		this.reloadList();
	}

	static setPageLines() {
		$.DispatchEvent('MainMenuSetPageLines', '', '');
	}

	static populateCampaigns() {
		const campaigns = CampaignAPI.GetAllCampaigns();
		for (let i = 0; i < campaigns.length; ++i) {
			const p = $.CreatePanel('Button', this.campaignList, 'campaign' + i);
			p.LoadLayoutSnippet('CampaignEntrySnippet');

			if (i < campaigns.length - 1) {
				p.AddClass('campaigns__entry__spaced');
			}

			const c = campaigns[i];

			this.campaignEntries.push(
				new CampaignEntry(
					i,
					p,
					c,
					c.meta[CampaignMeta.BOX_ART],
					c.meta[CampaignMeta.COVER],
					c.meta[CampaignMeta.SQUARE_LOGO],
					c.meta[CampaignMeta.BTN_BG],
					c.meta[CampaignMeta.DESC],
					c.meta[CampaignMeta.AUTHOR]
				)
			);

			p.SetPanelEvent('onmouseover', () => {
				CampaignSelector.onCampaignHovered(this.campaignEntries[i]);
			});

			this.campaignEntries[i].update();

			if (c.id === 'empty') this.campaignEntries[i].panel.visible = false;
		}
		stripDevTagsFromLabels(this.campaignList);

		if (this.campaignEntries.length > 0) {
			this.campaignEntries[0].panel.SetFocus();
		}
	}

	static onCampaignHovered(e: CampaignEntry) {
		let switchDelay = 0;

		if (!this.hoverContainer.HasClass('campaigns__boxart__container__show')) {
			this.hoverContainer.AddClass('campaigns__boxart__container__show');

			if (e.info === this.hoveredCampaign) return;
		} else {
			if (e.info === this.hoveredCampaign) return;

			switchDelay = 0.0;

			this.hoverInfo.AddClass('campaigns__boxart__bg__switch');
			const kfs = this.hoverInfo.CreateCopyOfCSSKeyframes('FadeIn');
			this.hoverInfo.UpdateCurrentAnimationKeyframes(kfs);
		}

		this.hoveredCampaign = e.info;

		$.Schedule(switchDelay, () => {
			if (e.boxartPath) this.hoverBoxart.SetImage(`file://${e.boxartPath}`);
			else this.hoverBoxart.SetImage(getRandomFallbackImage());
		});
	}

	static purgeCampaignList() {
		while (this.campaignEntries.length > 0) this.campaignEntries.pop()?.panel.DeleteAsync(0);
	}

	static reloadList() {
		this.purgeCampaignList();
		this.populateCampaigns();
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
}
