/**
 * Global event definitions for P2CE's UI
 */
interface GlobalEventNameMap {
	ReloadBackground: () => void;
	SettingsNavigateToPanel: (category, settingPanel) => void;
	SettingsSave: () => void;
	ColorPickerSave: (color) => void;
	ColorPickerCancel: () => void;
	MainMenuOpenNestedPage: (locH: string, locS: string, xmlName: string, payloadKey: string, payload: JsonValue | undefined) => void;
	MainMenuCloseAllPages: () => void;
	CampaignSettingHovered: (helpText: string) => void;
}
