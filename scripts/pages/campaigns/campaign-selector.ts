'use strict';

class CampaignEntry {
	index: number;
	panel: Button;
	info: CampaignPair;
	boxartPath: string | undefined;
	coverPath: string | undefined;
	iconPath: string | undefined;
	btnBgPath: string | undefined;
	desc: string | undefined;
	author: string | undefined;

	constructor(
		index: number,
		panel: Button,
		info: CampaignPair,
		boxart: string | undefined,
		cover: string | undefined,
		btnBg: string | undefined,
		desc: string | undefined,
		author: string | undefined
	) {
		this.index = index;
		this.panel = panel;
		this.info = info;
		this.boxartPath = boxart;
		this.coverPath = cover;
		this.btnBgPath = btnBg;
		this.desc = desc;
		this.author = author;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('CampaignTitle');
		const author = this.panel.FindChildTraverse<Label>('CampaignAuthor');
		const desc = this.panel.FindChildTraverse<Label>('CampaignDesc');
		const cover = this.panel.FindChildTraverse<Image>('CampaignCover');
		const btnBg = this.panel.FindChildTraverse<Image>('CampaignBtnBg');

		const basePath = getCampaignAssetPath(this.info);

		// eject out into the action bar
		if (this.index === 0) {
			this.panel.SetPanelEvent('onmoveup', () => {
				CampaignSelector.focusActionBar();
			});
		}

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
			$.DispatchEvent('MainMenuAnimatedSwitch', `${this.info.bucket.id}/${this.info.campaign.id}`);
			$.DispatchEvent('MainMenuCloseAllPages');
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
	static campaignList = $<Panel>('#CampaignContainer')!;
	static hoverContainer = $<Panel>('#HoveredCampaignContainer')!;
	static hoverInfo = $<Panel>('#HoveredCampaignInfo')!;
	static hoverBoxart = $<Image>('#HoveredCampaignBoxart')!;
	static campaignEntries: CampaignEntry[] = [];
	static hoveredCampaign: CampaignInfo | null = null;

	// filters by SP or MP
	static playerMode: PlayerMode;

	static focusActionBar() {
		$('#SearchBar')!.SetFocus();
	}

	static init() {
		this.hoverContainer.AddClass('campaigns__boxart__container__anim');

		installImageFallbackHandler(this.hoverBoxart);

		this.playerMode = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SELECTOR_TYPE] as PlayerMode;
		this.reloadList();
	}

	static createCampaignBtn(bucket: CampaignBucket, campaign: CampaignInfo, campaignIndex: number) {
		const p = $.CreatePanel('Button', this.campaignList, `Campaign_${bucket.id}-${campaign.id}`);
		p.LoadLayoutSnippet('CampaignEntrySnippet');
		p.AddClass('campaigns__entry__spaced');

		const m = CampaignAPI.GetCampaignMeta(`${bucket.id}/${campaign.id}`) ?? new Map<string, string>();
		if (m.size === 0) {
			$.Warning(`Campaign meta map for '${bucket.id}/${campaign.id}' couldn't be retrieved, or it was empty.`);
		}

		this.campaignEntries.push(
			new CampaignEntry(
				campaignIndex,
				p,
				{ bucket: bucket, campaign: campaign },
				m.get(CampaignMeta.BOX_ART),
				m.get(CampaignMeta.COVER),
				m.get(CampaignMeta.BTN_BG),
				m.get(CampaignMeta.DESC),
				m.get(CampaignMeta.AUTHOR)
			)
		);

		this.campaignEntries[campaignIndex].update();
	}

	static populateCampaigns() {
		const buckets = CampaignAPI.GetAllCampaignBuckets();
		let campaignIndex = 0;
		let hasAutoCampaign = false;

		for (const bucket of buckets) {
			if (isBucketSingleWsCampaign(bucket)) {
				hasAutoCampaign = true;
				break;
			}
		}

		for (const bucket of buckets) {
			if (isBucketSingleWsCampaign(bucket)) {
				continue;
			}
			for (const campaign of bucket.campaigns) {
				if (`${bucket.id}/${campaign.id}` === SpecialString.P2CE_SP_WS_CAMPAIGN && !hasAutoCampaign) {
					continue;
				}
				this.createCampaignBtn(bucket, campaign, campaignIndex);
				campaignIndex += 1;
			}
		}

		stripDevTagsFromLabels(this.campaignList);

		if (this.campaignEntries.length > 0) {
			this.campaignEntries[0].panel.SetFocus();
		}
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

	static purgeCampaignList() {
		while (this.campaignEntries.length > 0) this.campaignEntries.pop()?.panel.DeleteAsync(0);
	}

	static reloadList() {
		this.purgeCampaignList();
		this.populateCampaigns();
	}

	static hideBoxart() {
		if (this.hoverContainer.IsValid()) {
			this.hoverContainer.RemoveClass('campaigns__boxart__container__show');
		}
	}
}
