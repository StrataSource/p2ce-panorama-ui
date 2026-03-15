/**
 * Global event definitions for P2CE's UI
 */
interface GlobalEventNameMap {
	ReloadBackground: () => void;
	SettingsNavigateToPanel: (category, settingPanel) => void;
	SettingsSave: () => void;
	ColorPickerSave: (color) => void;
	ColorPickerCancel: () => void;
	MainMenuOpenNestedPage: (tab: string, xmlName: string, invokerPanel: GenericPanel | undefined) => void;
	MainMenuCloseAllPages: () => void;
	MainMenuSetPageLines: (headline: string, tagline: string) => void;
	MainMenuSwitchFade: (instantFade?: boolean, instantMenu?: boolean) => void;
	MainMenuSwitchReverse: (instant?: boolean) => void;
	MainMenuPagePreClose: (tab: string) => void;
	MainMenuSetFocus: () => void;
	CampaignSettingHovered: (helpText: string) => void;
	MainMenuFullBackNav: () => void;
	MainBackgroundLoaded: () => void;
	MainMenuAddButton: (btn: MenuButton) => void;
	MainMenuSetButtonProps: (btn: string, props: MenuButtonProps) => void;
	MainMenuSetLogo: (logo: string) => void;
	MainMenuSetLogoSize: (type: string) => void;
	MainMenuSetLoadingIndicatorVisibility: (visible: boolean) => void;
	MainMenuSetBackgroundImage: (img: string) => void;
	MainMenuShowBackgroundImage: (img?: string, instant?: boolean) => void;
	MainMenuHideBackgroundImage: (instant?: boolean) => void;
	MainMenuShowBackgroundMovie: (src: string) => void;
	MainMenuHideBackgroundMovie: () => void;
	MainMenuHideNav: (instant?: boolean) => void;
	MainMenuShowNav: (instant?: boolean) => void;
	MainMenuAddBgPanel: (panel: Panel) => void;
	MainMenuAnimatedSwitch: (campaign: string) => void;
	LoadingScreenClearLastMap: () => void;
	MainMenuModeRequestCleanup: () => void;
	MainMenuPageClosed: (from: string | undefined, to: string | undefined) => void;
	CampaignMenuRefreshUserSettings: () => void;
}
