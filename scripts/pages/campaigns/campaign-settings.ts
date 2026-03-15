'use strict';

class CampaignSettingsTab {
	static page = $.GetContextPanel();
	static logoImage = $<Image>('#CampaignSettingsBoxLogo')!;
	static chImage = $<Image>('#CampaignSettingsChapterImage')!;
	static chText = $<Label>('#CampaignSettingsChapter')!;
	//static mapText = $<Label>('#CampaignSettingsMap')!;
	static summaryPanel = $<Panel>('#CampaignSettingsSummaryPanel')!;
	static helpPage = $<Panel>('#CampaignSettingsHelp')!;
	static helpTxt = $<Label>('#CampaignSettingsHelpText')!;

	static settingsPage = $<Panel>('#CampaignSettingsBase')!;

	static campaign = CampaignAPI.GetActiveCampaign()!;
	static chapter = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] as VirtualChapter;

	static openSettingsPage: Panel | undefined = undefined;

	static init() {
		$.GetContextPanel().SetHasClass(
			'P2CESingleCampaign',
			this.chapter.type === CampaignDataType.P2CE_SINGLE_WS_SPECIAL
		);

		$.RegisterForUnhandledEvent('CampaignSettingHovered', this.onCampaignSettingHovered.bind(this));

		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Campaigns_Setup_Title'),
			$.Localize('#MainMenu_Campaigns_Setup_Tagline')
		);

		installImageFallbackHandler(this.chImage);

		this.show();

		const basePath = getCampaignAssetPath(this.campaign);
		const thumb = getChapterThumbnail(this.campaign, this.chapter);
		this.chImage.SetImage(thumb);

		const logo = CampaignAPI.GetCampaignMeta(`${this.campaign.bucket.id}/${this.campaign.campaign.id}`).get(
			CampaignMeta.SQUARE_LOGO
		);
		if (logo) this.logoImage.SetImage(`${basePath}${logo}`);
		else this.logoImage.visible = false;

		const chapterName = $.Localize(this.chapter.title);
		this.chText.text = chapterName.replace('\n', ': ');

		const mapSelBtn = $<Button>('#MapSelectionButton');
		if (mapSelBtn && this.chapter.maps.length === 1) {
			mapSelBtn.visible = false;
		}

		this.clear();

		//this.mapText.text = CampaignShared.getMap();

		$.RegisterForUnhandledEvent('CampaignMenuRefreshUserSettings', () => {
			this.updateSummary();
		});
	}

	static show() {
		this.page.visible = true;
	}

	static stepBack() {
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

	static clear() {
		CampaignShared.setup();
		this.updateSummary();
	}

	static finishSettings() {
		if (this.chapter.maps.length === 0) {
			const badCampaignId = this.campaign.campaign.id;
			const badChapterId = this.chapter.id;

			// Kick to menu
			this.clear();
			$.DispatchEvent('MainMenuCloseAllPages');

			// Display invalid map error message to user and log to console
			$.Warning(
				`Chapter index ${badChapterId} in campaign ${badCampaignId} has no maps defined in its corresponding KV3 data. Kicking to menu.`
			);
			UiToolkitAPI.ShowGenericPopupOk(
				$.Localize('#MainMenu_Campaigns_Error_InvalidChapterMapData_Title'),
				$.Localize('#MainMenu_Campaigns_Error_InvalidChapterMapData_Desc'),
				'warning-popup',
				() => {}
			);

			return;
		}

		this.applySettings();
		$.DispatchEvent('MainMenuCloseAllPages');
		GameInterfaceAPI.ConsoleCommand('disconnect');
		$.DispatchEvent('LoadingScreenClearLastMap');

		$.Schedule(0.01, () => {
			const desiredMap = CampaignShared.getMap();
			const mapIdx = desiredMap.index > 0 ? desiredMap.index : 0;

			let campaignId: string;
			let chapterId: string;
			if (this.chapter.type === CampaignDataType.P2CE_SINGLE_WS_SPECIAL) {
				campaignId = this.chapter.id;
				chapterId = 'auto';
			} else {
				campaignId = `${this.campaign.bucket.id}/${this.campaign.campaign.id}`;
				chapterId = this.chapter.id;
			}

			CampaignAPI.StartCampaign(campaignId, chapterId, mapIdx);

			this.clear();
		});
	}

	static openSettingsSubpage(tab: string, invoker: Button, locH: string, locS: string, xml?: string) {
		if (this.openSettingsPage) {
			this.openSettingsPage.RemoveAndDeleteChildren();
			this.openSettingsPage.DeleteAsync(0);
		}

		const newPanel = $.CreatePanel('Panel', this.settingsPage, tab);
		this.settingsPage.MoveChildAfter(newPanel, invoker);

		const layoutFile = xml ? xml : 'settings-base';
		newPanel.LoadLayout(`file://{resources}/layout/pages/campaigns/${layoutFile}.xml`, false, false);
		newPanel.RegisterForReadyEvents(true);
		newPanel.SetFocus();

		this.openSettingsPage = newPanel;
	}

	static updateSummary() {
		this.summaryPanel.RemoveAndDeleteChildren();

		const allSettings = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
			string,
			Record<string, CampaignSetting>
		>;

		Object.entries(allSettings).forEach((v: [string, Record<string, CampaignSetting>], i: number) => {
			const p = $.CreatePanel('Label', this.summaryPanel, `SummaryHeading${i}`, {
				class: 'campaign-settings__summary__header',
				text: v[0]
			});

			let applied = 0;
			const settings = Object.values(v[1]);
			for (let j = 0; j < settings.length; ++j) {
				// iterate through each one and determine if they've changed
				// if they have, display that
				const entry = settings[j];

				// eslint-disable-next-line eqeqeq
				if (entry.currentValue == entry.def) {
					// skip values that are exactly the same
					continue;
				}

				let displayText = '';
				if (entry.panelType === 'ToggleButton') {
					displayText = `<b>${entry.name}</b>`;
				} else if (entry.panelType === 'DropDown') {
					displayText = `<b>${entry.name}:</b> ${entry.dropDownValues![Number(entry.currentValue)].text}`;
				} else {
					displayText = `<b>${entry.name}:</b> ${entry.currentValue}`;
				}

				$.CreatePanel('Label', this.summaryPanel, `SummaryHeading${i}`, {
					class: 'campaign-settings__summary__text',
					html: true,
					text: displayText
				});

				++applied;
			}

			// no changes applied to this section
			if (applied === 0) {
				p.visible = false;
				//$.CreatePanel('Label', this.summaryPanel, `SummaryHeading${i}`, {
				//	class: 'campaign-settings__summary__text',
				//	html: true,
				//	text: `<b>${$.Localize('#MainMenu_Campaigns_Setup_Summary_NoChanges')}</b>`
				//});
			}
		});
	}

	static applySettings() {
		const allSettings = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
			string,
			Record<string, CampaignSetting>
		>;

		for (const group of Object.values(allSettings)) {
			for (const setting of Object.values(group)) {
				if (setting.command.length === 0) {
					// skip settings that do not specify a command
					continue;
				}

				if (setting.command === 'sv_cheats') {
					if (
						GameInterfaceAPI.GetSettingInt('developer') > 0 ||
						GameInterfaceAPI.GetSettingBool('sv_cheats')
					) {
						$.Warning('Developer mode enabled or sv_cheats is already 1. Not applying sv_cheats setting.');
						continue;
					}
				}

				// we execute commands that are at their default anyway to
				// reset any of these convars back to their original state,
				// in case they were ever overridden. simple enough.
				// doesn't reset them if the player enters a map on their
				// own manually, but, WHATEVER!

				if (setting.panelType === 'DropDown') {
					$.Msg(`Execute ${setting.command} ${setting.dropDownValues![Number(setting.currentValue)].value}`);
					GameInterfaceAPI.ConsoleCommand(
						`${setting.command} "${setting.dropDownValues![Number(setting.currentValue)].value}"`
					);
				} else if (setting.panelType === 'ToggleButton') {
					const actualValueToApply = Number(setting.currentValue);
					$.Msg(`Execute ${setting.command} ${actualValueToApply}`);
					GameInterfaceAPI.ConsoleCommand(`${setting.command} "${actualValueToApply}"`);
				} else {
					$.Msg(`Execute ${setting.command} ${setting.currentValue}`);
					GameInterfaceAPI.ConsoleCommand(`${setting.command} "${setting.currentValue}"`);
				}
			}
		}
	}

	static onCampaignSettingHovered(helpText) {
		//this.helpTxt.text = helpText;
	}
}
