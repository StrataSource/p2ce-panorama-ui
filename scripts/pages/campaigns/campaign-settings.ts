'use strict';

class CampaignSettingsTab {
	static page = $<Panel>('#CampaignSettingsContainer')!;
	static chImage = $<Image>('#CampaignSettingsChapterImage')!;
	static chText = $<Label>('#CampaignSettingsChapter')!;
	static mapText = $<Label>('#CampaignSettingsMap')!;
	static summaryPanel = $<Panel>('#CampaignSettingsSummaryPanel')!;
	static basePage = $<Panel>('#CampaignSettingsBase')!;
	static subPage = $<Panel>('#CampaignSettingsSubpage')!;
	static header = $<Label>('#CampaignSettingsHeader')!;
	static subheader = $<Label>('#CampaignSettingsSubheader')!;
	static startBtn = $<Button>('#CampaignSettingsStart')!;
	static helpPage = $<Panel>('#CampaignSettingsHelp')!;
	static helpTxt = $<Label>('#CampaignSettingsHelpText')!;

	static activeSubpage = '';

	static init() {
		this.hide();
		this.startBtn.SetPanelEvent('onmouseout', () => { UiToolkitAPI.HideTextTooltip(); });
	
		$.RegisterForUnhandledEvent('CampaignSettingHovered', this.onCampaignSettingHovered.bind(this));
	}

	static setActive() {
		CampaignHome.closeListerNoReturn();
		this.show();
		this.chImage.SetImage(`file://{materials}/${CampaignMgr.uiSelectedChapter!.thumbnail}.vtf`);
		this.chText.text = $.Localize(CampaignMgr.uiSelectedChapter!.title);
		this.mapText.text = CampaignMgr.uiSelectedChapter!.maps[0].name;
	}

	static show() {
		this.page.visible = true;
		this.setHeaderText(tagDevString('Campaign Settings'), tagDevString('Customize your experience'));
	}

	static setHeaderText(header: string, subheader: string) {
		this.header.text = header;
		this.subheader.text = subheader;
	}

	static hide() {
		this.page.visible = false;
		this.closeSettingsSubpage();
	}

	static stepBack() {
		if (this.activeSubpage) {
			this.closeSettingsSubpage();
		} else {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				tagDevString('Exit Campaign Setup'),
				tagDevString('Are you sure you want to leave Campaign Setup?\nYou will lose the settings you have changed so far!'),
				'warning-popup',
				$.Localize('#UI_Yes'),
				() => {
					this.clear();
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		}
	}

	static clear() {
		this.closeSettingsSubpage();
		this.subPage.RemoveAndDeleteChildren();
		this.hide();
		CampaignHome.openControls();
	}

	static finishSettings() {
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.Localize('#Action_NewGame_Title'),
			tagDevString('Start a new game with these settings?\n\nWARNING: Gameplay modifiers cannot be changed once a save has started!'),
			'warning-popup',
			$.Localize('#UI_Yes'),
			() => {
				CampaignMgr.startGame();
				this.clear();
			},
			$.Localize('#UI_Cancel'),
			() => {},
			'blur'
		);
	}

	static openSettingsSubpage(tab: string, xml: string, locH: string, locS: string) {
		this.startBtn.SetPanelEvent('onmouseover', () => { UiToolkitAPI.ShowTextTooltip(this.startBtn.id, tagDevString('Complete your changes and go back in order to start the campaign.')); });
		
		this.basePage.visible = false;
		this.subPage.visible = true;
		this.startBtn.enabled = false;

		this.setHeaderText(tagDevString(locH), tagDevString(locS));

		// Check for existence
		if (!this.subPage.FindChildTraverse(tab)) {
			const p = $.CreatePanel('Panel', this.subPage, tab);

			p.LoadLayout(`file://{resources}/layout/pages/campaigns/${xml}.xml`, false, false);
			p.SetAttributeString('settings.category', tab);
			p.SetAttributeString('settings.name', locH);
			p.RegisterForReadyEvents(true);

			stripDevTagsFromLabels(p);
		}

		// Check active subtab
		// Generally this shouldn't happen but there might be cases
		// where code forces open a subtab when we're already in one
		if (this.activeSubpage !== tab) {
			if (this.activeSubpage) {
				const hide = this.subPage.FindChildTraverse(this.activeSubpage);
				if (hide) hide.visible = false;
			}

			this.activeSubpage = tab;
			const active = this.subPage.FindChildTraverse(tab);
			if (active) {
				active.visible = true;
				active.SetReadyForDisplay(true);
			}
		}

		this.helpPage.visible = true;
	}

	static closeSettingsSubpage() {
		if (this.activeSubpage) {
			const hide = this.subPage.FindChildTraverse(this.activeSubpage);
			if (hide) {
				hide.visible = false;
			}
		}

		this.subPage.visible = false;
		this.basePage.visible = true;
		this.helpPage.visible = false;
		this.startBtn.enabled = true;

		this.setHeaderText(tagDevString('Campaign Settings'), tagDevString('Customize your experience'));

		this.startBtn.ClearPanelEvent('onmouseover');

		this.activeSubpage = '';

		this.updateSummary();
	}

	static updateSummary() {
		const subpages = this.subPage.Children();

		this.summaryPanel.RemoveAndDeleteChildren();

		for (let i = 0; i < subpages.length; ++i) {
			const subpage = subpages[i];
			const cat = subpage.GetAttributeString('settings.category', 'none');

			if (cat === 'none' || cat === 'Presets' || cat === 'MapSelect') continue;
			
			$.CreatePanel(
				'Label',
				this.summaryPanel,
				`SummaryHeading${i}`, {
					class: 'campaign-settings__summary__header',
					text: `${subpage.GetAttributeString('settings.name', 'NOT FOUND')}`
				}
			);

			const nonDefaults = CampaignShared.FetchNonDefaultSettings(subpage);

			if (nonDefaults.length === 0) {
				$.CreatePanel(
					'Label',
					this.summaryPanel,
					`SummaryHeading${i}`, {
						class: 'campaign-settings__summary__text',
						html: true,
						text: '<b>No changes detected.</b>'
					}
				);
			}

			for (let j = 0; j < nonDefaults.length; ++j) {
				const entry = nonDefaults[j];
				$.CreatePanel(
					'Label',
					this.summaryPanel,
					`SummaryHeading${i}`, {
						class: 'campaign-settings__summary__text',
						html: true,
						text: `<b>- ${entry.name}:</b> ${entry.actual}`
					}
				);
			}
		}
	}

	static onCampaignSettingHovered(helpText) {
		this.helpTxt.text = helpText;
	}
}
