'use strict';

/**
 * Find campaign by map.
 * Returns undefined if it doesn't exist.
 */
function getCampaignFromMap(mapToFind: string) {
	const campaigns = CampaignAPI.GetAllCampaigns();
	const matching = campaigns.find((campaign: CampaignInfo) => {
		return campaign.chapters.find((chapter: ChapterInfo) => {
			return chapter.maps.find((map) => {
				return map.name === mapToFind;
			}) !== undefined;
		}) !== undefined;
	});
	return matching;
}

class CampaignMgr {
	static currentCampaign: CampaignInfo | null = null;
	static isInitialized: boolean = false;
	static isInUnspecifiedMap = false;

	static init() {
		CampaignSelector.init();
		CampaignHome.init();

		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onCampaignScreenShown.bind(this));

		this.isInitialized = true;

		this.checkOpenCampaign();
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns' || !this.isInitialized) return;

		CampaignHome.closeLister();
		
		this.checkOpenCampaign();

		CampaignSelector.onCampaignScreenShown(tabid);
		CampaignHome.onCampaignScreenShown(tabid);
	}

	static checkOpenCampaign() {
		const openCampaign = $.persistentStorage.getItem('campaigns.open');

		if (openCampaign) {
			$.Msg(`openCampaign defined, attempting to force open: ${openCampaign}`);

			const campaigns = CampaignAPI.GetAllCampaigns();
			const c = campaigns.find((campaign: CampaignInfo) => { return campaign.id === openCampaign });

			if (c) {
				this.campaignSelected(c);
				this.isInUnspecifiedMap = false;
			}
			else $.Warning(`Campaign of ID ${openCampaign} does not exist`);

			$.persistentStorage.removeItem('campaigns.open');
		} else if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			const curMap = GameInterfaceAPI.GetCurrentMap()!;
			const mapCampaign = getCampaignFromMap(curMap);

			this.isInUnspecifiedMap = mapCampaign === undefined;

			if (!CampaignSelector.isHidden) {
				$.Msg('Game in progress and selector open, attempting to force open a campaign...');

				if (mapCampaign) {
					this.campaignSelected(mapCampaign);
					this.isInUnspecifiedMap = false;
				}
				else $.Warning(`Map ${GameInterfaceAPI.GetCurrentMap()} does not belong to any defined campaigns`);
			} else {
				if (mapCampaign) {
					if (!this.currentCampaign || this.currentCampaign.id !== mapCampaign.id) {
						$.Warning(`Campaign mismatch (should be ${mapCampaign.id}) while in-game. Switching...`);
						this.campaignSelected(mapCampaign);
						this.isInUnspecifiedMap = false;
					}
				}
			}
		}
	}

	static startGame(chapter: string) {
		if (this.currentCampaign) {
			$.Msg(`Start: ${CampaignMgr.currentCampaign!.id}: ${chapter}`);
			CampaignAPI.StartCampaign(CampaignMgr.currentCampaign!.id, chapter);
		}
	}

	static campaignSelected(info: CampaignInfo) {
		this.currentCampaign = info;

		CampaignSelector.playAwayAnim();
		CampaignHome.setActive();
	}
}
