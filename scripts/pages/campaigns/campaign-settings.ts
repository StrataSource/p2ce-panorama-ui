'use strict';

class CampaignSettingsTab {
	static page = $.GetContextPanel();
	static chImage = $<Image>('#CampaignSettingsChapterImage')!;
	static chText = $<Label>('#CampaignSettingsChapter')!;
	static mapText = $<Label>('#CampaignSettingsMap')!;
	static summaryPanel = $<Panel>('#CampaignSettingsSummaryPanel')!;
	static subPage = $<Panel>('#CampaignSettingsSubpage')!;
	static helpPage = $<Panel>('#CampaignSettingsHelp')!;
	static helpTxt = $<Label>('#CampaignSettingsHelpText')!;

	static campaign = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CAMPAIGN] as CampaignInfo;
	static chapter = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] as ChapterInfo;

	static activeSubpage = '';

	static init() {
		$.RegisterForUnhandledEvent('CampaignSettingHovered', this.onCampaignSettingHovered.bind(this));

		this.show();
		this.chImage.SetImage(`file://{materials}/${this.chapter.thumbnail}.vtf`);
		this.chText.text = $.Localize(this.chapter.title);
		this.mapText.text = this.chapter.maps[0].name;

		this.clear();
	}

	static show() {
		this.page.visible = true;
	}

	static stepBack() {
		if (this.activeSubpage) {
			this.closeSettingsSubpage();
		} else {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#MainMenu_Campaigns_Setup_Discard_Title'),
				$.Localize('#MainMenu_Campaigns_Setup_Discard_Description'),
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
	}

	static finishSettings() {
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.Localize('#Action_NewGame_Title'),
			$.Localize('#Action_NewGame_CampaignSetup_Description'),
			'warning-popup',
			$.Localize('#UI_Yes'),
			() => {
				this.applySettings();
				this.clear();
				$.DispatchEvent('MainMenuCloseAllPages');
				$.Schedule(0.001, () => CampaignAPI.StartCampaign(this.campaign.id, this.chapter.id));
			},
			$.Localize('#UI_Cancel'),
			() => {},
			'blur'
		);
	}

	static openSettingsSubpage(tab: string, locH: string, locS: string, xml?: string) {
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTING_PAGE] = tab;
		$.DispatchEvent('MainMenuOpenNestedPage', tab, 'campaigns/settings-base');
		$.DispatchEvent('MainMenuSetPageLines', $.Localize(locH), $.Localize(locS));

		//$.DispatchEvent('MainMenuOpenNestedPage', tab, `campaigns/${xml}`);

		/*

		//this.setHeaderText($.Localize(locH), $.Localize(locS));

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
		*/
	}

	static closeSettingsSubpage() {
		this.activeSubpage = '';

		this.updateSummary();
	}

	static updateSummary() {
		/*
		const subpages = this.subPage.Children();

		this.summaryPanel.RemoveAndDeleteChildren();

		// iterate through all setting subpages
		// TODO: do in specific order (order of buttons)
		for (let i = 0; i < subpages.length; ++i) {
			const subpage = subpages[i];
			const cat = subpage.GetAttributeString('settings.category', 'none');

			// skip these ones, they're not helpful
			if (cat === 'none' || cat === 'Presets' || cat === 'MapSelect') continue;

			$.CreatePanel('Label', this.summaryPanel, `SummaryHeading${i}`, {
				class: 'campaign-settings__summary__header',
				text: `${subpage.GetAttributeString('settings.name', 'NOT FOUND')}`
			});

			// fetch page settings
			const settings = CampaignShared.FetchPageSettings(subpage);

			// iterate through each one and determine if they've changed
			// if they have, display that
			let applied = 0;
			for (let j = 0; j < settings.length; ++j) {
				const entry = settings[j];

				if (entry.defaultVal === entry.actual) {
					// skip values that are exactly the same
					continue;
				}

				$.CreatePanel('Label', this.summaryPanel, `SummaryHeading${i}`, {
					class: 'campaign-settings__summary__text',
					html: true,
					text: `<b>- ${entry.name}:</b> ${entry.actual}`
				});

				++applied;
			}

			// no changes applied to this section
			if (applied === 0) {
				$.CreatePanel('Label', this.summaryPanel, `SummaryHeading${i}`, {
					class: 'campaign-settings__summary__text',
					html: true,
					text: '<b>#MainMenu_Campaigns_Setup_Summary_NoChanges</b>'
				});
			}
		}
		*/
	}

	static applySettings() {
		/*
		const subpages = this.subPage.Children();
		for (let i = 0; i < subpages.length; ++i) {
			const subpage = subpages[i];
			const cat = subpage.GetAttributeString('settings.category', 'none');

			// skip these ones, they're not helpful
			if (cat === 'none' || cat === 'Presets' || cat === 'MapSelect') continue;

			// fetch page settings
			const settings = CampaignShared.FetchPageSettings(subpage);

			// iterate through each one and determine if they've changed
			// if they have, display that
			for (let j = 0; j < settings.length; ++j) {
				const entry = settings[j];

				if (entry.defaultVal === entry.actual) {
					// skip values that are exactly the same
					continue;
				}

				$.Msg(`Execute ${entry.command} ${entry.actual}`);
				GameInterfaceAPI.ConsoleCommand(`${entry.command} ${entry.actual}`);
			}
		}
		*/
	}

	static onCampaignSettingHovered(helpText) {
		//this.helpTxt.text = helpText;
	}
}
