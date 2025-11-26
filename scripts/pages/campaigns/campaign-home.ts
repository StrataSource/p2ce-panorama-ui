'use strict';

class CampaignHome {
	static campaignStartPage = $<Panel>('#CampaignStartPage')!;
	static campaignBg = $<Image>('#CampaignBackground')!;
	static campaignLogo = $<Image>('#CampaignLogo')!;
	static campaignListerContainer = $<Panel>('#CampaignListerContainer')!;
	static campaignLister = $<Panel>('#CampaignLister')!;
	static campaignControls = $<Panel>('#CampaignControls')!;

	static campaignLoadLatestBtn = $<Button>('#CampaignLoadLatestBtn')!;
	static campaignAllSavesBtn = $<Button>('#CampaignAllSavesBtn')!;
	static campaignSaveBtn = $<Button>('#CampaignSaveBtn')!;

	static init() {
		this.campaignStartPage.visible = false;

		$.RegisterEventHandler('PropertyTransitionEnd', this.campaignStartPage, (panelName, propertyName) => {
			if (propertyName === 'opacity') {
				if (this.campaignStartPage.IsTransparent()) {
					this.campaignStartPage.visible = false;
				}
			}
		});

		this.closeLister();
	}

	static show() {
		//this.campaignBg.SetImage(CampaignMgr.currentCampaign.background);
		this.campaignStartPage.visible = true;
		this.campaignStartPage.AddClass('selected-campaign__anim');
		this.campaignStartPage.AddClass('selected-campaign__show');

		$<Label>('#CampaignNamePlaceholder')!.text = `[DEV] DO NOT LOCALIZE - Campaign: ${CampaignMgr.currentCampaign!.title}`;
		this.updateButtons();
		this.checkOpenTab();
	}

	static hide() {
		this.closeLister();
		this.campaignStartPage.RemoveClass('selected-campaign__show');
		CampaignSelector.playReturnAnim();
	}

	static hideInstant() {
		this.closeLister();
		this.campaignStartPage.RemoveClass('selected-campaign__show');
		this.campaignStartPage.visible = false;
		CampaignSelector.playReturnAnim();
	}

	static setActive() {
		//if (CampaignMgr.currentCampaign) {
		//	this.campaignLogo.SetImage(CampaignMgr.currentCampaign.logo);
		//}

		this.show();
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.updateButtons();
	}

	static updateButtons() {
		if (CampaignMgr.currentCampaign === null) return;

		const hasSaves = GameSavesAPI.GetGameSaves().filter((v: GameSave) => {
			return v.mapGroup === CampaignMgr.currentCampaign!.id;
		}).length > 0;

		this.campaignAllSavesBtn.enabled = hasSaves;
		this.campaignLoadLatestBtn.enabled = hasSaves;

		const isInGame = GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU;

		// only save game when in game
		const saveBtn = $('#CampaignSaveBtn')!;
		saveBtn.visible = isInGame;
		saveBtn.ClearPanelEvent('onmouseover');
		saveBtn.ClearPanelEvent('onmouseout');
		saveBtn.enabled = !GameInterfaceAPI.GetSettingBool('map_wants_save_disable') && !CampaignMgr.isInUnspecifiedMap;
		if (GameInterfaceAPI.GetSettingBool('map_wants_save_disable')) {
			saveBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					saveBtn.id,
					$.Localize('#MainMenu_SaveRestore_SaveFailed_MapWantsSaveDisabled')
				);
			});
			saveBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		} else if (CampaignMgr.isInUnspecifiedMap) {
			saveBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					saveBtn.id,
					$.Localize('#MainMenu_SaveRestore_SaveFailed_NotPartOfCampaign')
				);
			});
			saveBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		}

		const returnBtn = $('#CampaignStartReturn')!;
		returnBtn.enabled = !isInGame || CampaignMgr.isInUnspecifiedMap;
		returnBtn.ClearPanelEvent('onmouseover');
		returnBtn.ClearPanelEvent('onmouseout');
		if (!returnBtn.enabled) {
			returnBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					returnBtn.id,
					$.Localize('#MainMenu_Campaigns_MM_ReturnToCampaignMenu_InGame')
				);
			});
			returnBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		}
	}

	static checkOpenTab() {
		// check if a tab is queued to be opened
		const tabToOpen = $.persistentStorage.getItem('campaigns.showTab');

		if (tabToOpen) {
			const tabBtn = this.campaignControls.FindChildTraverse<Button>(tabToOpen as string);
			if (tabBtn) {
				$.DispatchEvent('Activated', tabBtn, PanelEventSource.MOUSE);
			} else {
				$.Warning('campaigns.showTab defined but invalid value');
			}
			$.persistentStorage.removeItem('campaigns.showTab');
		}
	}

	static closeLister() {
		this.closeListerNoReturn();
		this.campaignControls.visible = true;
	}

	static closeListerNoReturn() {
		this.campaignLister.ScrollToTop();
		this.campaignListerContainer.visible = false;
	}

	static openControls() {
		this.campaignControls.visible = true;
	}
}
