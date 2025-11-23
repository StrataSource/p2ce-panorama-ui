/**
 * Global event definitions for P2CE's UI
 */
interface GlobalEventNameMap {
	ReloadBackground: () => void;
	HideContentPanel: () => void;
	ShowContentPanel: () => void;
	MainMenuTabShown: (tabid) => void;
	MainMenuTabHidden: (tabid) => void;
	SettingsNavigateToPanel: (category, settingPanel) => void;
	SettingsSave: () => void;
	ExtendDrawer: () => void;
	RetractDrawer: () => void;
	ToggleDrawer: () => void;
	Drawer_UpdateLobbyButton: (imagesrc, playercount) => void;
	Drawer_NavigateToTab: (tabid) => void;
	Drawer_ExtendAndNavigateToTab: (tabid) => void;
	ColorPickerSave: (color) => void;
	ColorPickerCancel: () => void;
	CampaignSettingHovered: (helpText: string) => void;
}
