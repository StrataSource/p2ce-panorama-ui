'use strict';

class MainMenuCampaignMode {
	static logo = $<Image>('#GameFullLogo')!;
	static campaignDevTxt = $<Label>('#DevCampaign')!;
	static selectedCampaign: CampaignInfo;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('SetActiveUiCampaign', this.onCampaignSelected.bind(this));
	}

	static onCampaignSelected(id: string) {
		const campaign = CampaignAPI.GetAllCampaigns().find((v) => { return v.id === id });
		if (!campaign) {
			$.Warning(`Menu: Campaign ID ${id} received but that's not a valid Campaign?`);
			return;
		}

		this.selectedCampaign = campaign;

		$.GetContextPanel().AddClass('CampaignSelected');

		// TODO: Set logo image appropriately
		this.logo.SetImage('file://{images}/menu/portal2/full_logo.png');
		this.campaignDevTxt.text = `[DEV] Campaign: ${campaign.title} (${id})`;
	}

	static exitCampaign() {
		$.GetContextPanel().RemoveClass('CampaignSelected');

		this.logo.SetImage('file://{images}/logo.svg');
		this.campaignDevTxt.text = '[DEV] No Campaign Active';
	}
}
