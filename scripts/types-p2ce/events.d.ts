/**
 * Global event definitions for P2CE's UI
 */
interface GlobalEventNameMap {
	ReloadBackground: () => void;
	SettingsNavigateToPanel: (category, settingPanel) => void;
	SettingsSave: () => void;
	ColorPickerSave: (color) => void;
	ColorPickerCancel: () => void;
	MainMenuOpenNestedPage: (tab: string, xmlName: string, invokerPanel: Panel | undefined) => void;
	MainMenuCloseAllPages: () => void;
	MainMenuSetPageLines: (headline: string, tagline: string) => void;
	MainMenuSwitchFade: () => void;
	MainMenuPagePreClose: (tab: string) => void;
	MainMenuSetFocus: () => void;
	CampaignSettingHovered: (helpText: string) => void;
	SetActiveUiCampaign: (campaignId: string) => void;
	MainMenuFullBackNav: () => void;
}
