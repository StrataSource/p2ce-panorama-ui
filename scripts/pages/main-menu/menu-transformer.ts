'use strict';

class MainMenuCampaignMode {
	static logo = $<Image>('#GameFullLogo')!;
	static campaignDevTxt = $<Label>('#DevCampaign')!;
	static selectedCampaign: CampaignInfo;

	static continueBtn = $<Button>('#CampaignContinueBtn')!;
	static continueText = $<Label>('#ContinueCampaignText')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueLogo = $<Image>('#ContinueSaveLogo')!;
	static continueHeadline = $<Label>('#ContinueSaveHeadline')!;
	static continueTagline = $<Label>('#ContinueSaveTagline')!;

	static latestSave: GameSave;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('SetActiveUiCampaign', this.onCampaignSelected.bind(this));
	}

	static setContinueDetails() {
		const saves = GameSavesAPI.GetGameSaves()
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime))
			.filter((a) => { return a.mapGroup === this.selectedCampaign.id });
		
		this.continueBtn.enabled = false;
		this.continueText.text = $.Localize('MainMenu_SaveRestore_NoSaves');

		if (saves.length === 0) {
			$.Warning('CONTINUE: No saves');
			return;
		}

		this.latestSave = saves[0];

		const savChapter = this.selectedCampaign.chapters.find((ch) => {
			return ch.maps.find((map) => {
				return map.name === this.latestSave.mapName;
			}) !== undefined;
		});

		if (!savChapter) {
			$.Warning('CONTINUE: Map could not be found for Campaign');
			return;
		}

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		this.continueText.text = `${savChapter.title}`;
		this.continueHeadline.text = `${this.latestSave.mapName}`;
		this.continueTagline.text = `${new Date(Number(this.latestSave.fileTime) * 1000).toDateString()}`
	
		this.continueBtn.SetPanelEvent(
			'onactivate',
			() => {
				if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_LoadGame_Confirm'),
						$.Localize('#Action_LoadGame_Auto_Message'),
						'warning-popup',
						$.Localize('#Action_LoadGame'),
						() => {
							CampaignAPI.ContinueCampaign(this.selectedCampaign.id);
						},
						$.Localize('#UI_Cancel'),
						() => {},
						'blur'
					);
				} else {
					CampaignAPI.ContinueCampaign(this.selectedCampaign.id);
				}
			}
		);

		this.continueBtn.enabled = true;
	}

	static onCampaignSelected(id: string) {
		const campaign = CampaignAPI.GetAllCampaigns().find((v) => { return v.id === id });
		if (!campaign) {
			$.Warning(`Menu: Campaign ID ${id} received but that's not a valid Campaign?`);
			return;
		}

		this.selectedCampaign = campaign;
		UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] = campaign;

		$.GetContextPanel().AddClass('CampaignSelected');

		// TODO: Set logo image appropriately
		this.logo.SetImage('file://{images}/menu/portal2/full_logo.svg');
		this.campaignDevTxt.text = `[DEV] Campaign: ${campaign.title} (${id})`;
	
		this.setContinueDetails();
	}

	static exitCampaign() {
		$.GetContextPanel().RemoveClass('CampaignSelected');

		UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] = undefined;
		this.logo.SetImage('file://{images}/logo.svg');
		this.campaignDevTxt.text = '[DEV] No Campaign Active';

		MainMenu.setContinueDetails();
	}
}
