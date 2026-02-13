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
	static chapter = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] as ChapterInfo;

	static advancedOpened = false;

	static openSettingsPage: Panel | undefined = undefined;

	static init() {
		$.RegisterForUnhandledEvent('CampaignSettingHovered', this.onCampaignSettingHovered.bind(this));
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Campaigns_Setup_Title'),
			$.Localize('#MainMenu_Campaigns_Setup_Tagline')
		);

		$.RegisterEventHandler('ImageFailedLoad', this.chImage, () => {
			// defaultsrc attribute is unreliable
			this.chImage.SetImage('file://{images}/menu/p2ce-generic.png');
		});

		this.show();

		const basePath = getCampaignAssetPath(this.campaign);
		const thumb = this.chapter.meta.get(CampaignMeta.CHAPTER_THUMBNAIL);
		if (thumb) {
			if ((thumb as string).startsWith('http')) {
				this.chImage.SetImage(thumb);
			} else {
				this.chImage.SetImage(`${basePath}${thumb}`);
			}
		} else {
			this.chImage.SetImage(getRandomFallbackImage());
		}

		const logo = CampaignAPI.GetCampaignMeta(`${this.campaign.bucket.id}/${this.campaign.campaign.id}`).get(CampaignMeta.SQUARE_LOGO);
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
				() => {},
				'blur'
			)
			
			return;
		}
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.Localize('#Action_NewGame_Title'),
			$.Localize('#Action_NewGame_CampaignSetup_Description'),
			'warning-popup',
			$.Localize('#UI_Yes'),
			() => {
				this.applySettings();
				$.DispatchEvent('MainMenuCloseAllPages');
				GameInterfaceAPI.ConsoleCommand('disconnect');
				$.DispatchEvent('LoadingScreenClearLastMap');

				// FIXME: StartCampaign should be expanded to include which map to play
				// map command doesn't play very nice with the system. when that gets in
				// change this accordingly
				$.Schedule(0.1, () => {
					const desiredMap = CampaignShared.getMap();
					if (desiredMap === this.chapter.maps[0].name) {
						CampaignAPI.StartCampaign(this.campaign.campaign.id, this.chapter.id);
						this.clear();
					} else {
						$.Warning(
							`CAMPAIGN SETTINGS: JUMPING TO SPECIFIC MAP IN CHAPTER! DON'T FORGET TO CHANGE THIS! ${desiredMap}`
						);
						GameInterfaceAPI.ConsoleCommand(`map "${desiredMap}"`);
						this.clear();
					}
				});
			},
			$.Localize('#UI_Cancel'),
			() => {},
			'blur'
		);
	}

	static toggleSettingButtons() {
		this.advancedOpened = !this.advancedOpened;

		this.settingsPage.visible = this.advancedOpened;
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
						`${setting.command} ${setting.dropDownValues![Number(setting.currentValue)].value}`
					);
				} else {
					$.Msg(`Execute ${setting.command} ${setting.currentValue}`);
					GameInterfaceAPI.ConsoleCommand(`${setting.command} ${setting.currentValue}`);
				}
			}
		}

		//for (let i = 0; i < subpages.length; ++i) {
		//	const subpage = subpages[i];
		//	const cat = subpage.GetAttributeString('settings.category', 'none');
		//	// skip these ones, they're not helpful
		//	if (cat === 'none' || cat === 'Presets' || cat === 'MapSelect') continue;
		//	// fetch page settings
		//	const settings = CampaignShared.FetchPageSettings(subpage);
		//	// iterate through each one and determine if they've changed
		//	// if they have, display that
		//	for (let j = 0; j < settings.length; ++j) {
		//		const entry = settings[j];
		//		if (entry.defaultVal === entry.actual) {
		//			// skip values that are exactly the same
		//			continue;
		//		}
		//		$.Msg(`Execute ${entry.command} ${entry.actual}`);
		//		GameInterfaceAPI.ConsoleCommand(`${entry.command} ${entry.actual}`);
		//	}
		//}
	}

	static onCampaignSettingHovered(helpText) {
		//this.helpTxt.text = helpText;
	}
}
