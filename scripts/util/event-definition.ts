'use strict';

//--------------------------------------------------------------------------------------------------
// Common place to define new events with panorama.
//
// Usage:   $.DefineEvent( eventName, NumArguments, [optional] ArgumentsDescription, [optional] Description )
//          $.DefinePanelEvent( eventName, NumArguments, [optional] ArgumentsDescription, [optional] Description )
//
// Example: $.DefineEvent( 'MyCustomEvent', 2, 'args1, args2', 'Event defined in javascript' )
//
// General documentation about events can be found on
//          https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/Panorama/Events
//
//--------------------------------------------------------------------------------------------------

$.DefineEvent('ReloadBackground', 0, '', 'Reloads the main menu background');

$.DefineEvent('SettingsNavigateToPanel', 2, 'category, settingPanel', 'Navigates to a setting by panel handle');
$.DefineEvent('SettingsSave', 0, 'Save the settings out to file (host_writeconfig)');

$.DefineEvent('ColorPickerSave', 1, 'color');
$.DefineEvent('ColorPickerCancel', 0);

$.DefineEvent('CampaignSettingHovered', 1, 'helpText');

$.DefineEvent('MainMenuOpenNestedPage', 3);
$.DefineEvent('MainMenuCloseAllPages', 0);
$.DefineEvent('MainMenuSetPageLines', 2);
$.DefineEvent('MainMenuSwitchFade', 2);
$.DefineEvent('MainMenuSwitchReverse', 1);
$.DefineEvent('MainMenuFullBackNav', 0);
$.DefineEvent('MainMenuPagePreClose', 1);
$.DefineEvent('MainMenuSetFocus', 0);
$.DefineEvent('MainBackgroundLoaded', 0);
$.DefineEvent('MainMenuAddButton', 1);
$.DefineEvent('MainMenuSetButtonProps', 2);
$.DefineEvent('MainMenuSetLogo', 1);
$.DefineEvent('MainMenuSetLogoSize', 1);
$.DefineEvent('MainMenuSetLoadingIndicatorVisibility', 1);
$.DefineEvent('MainMenuSetBackgroundImage', 1);
$.DefineEvent('MainMenuShowBackgroundImage', 2);
$.DefineEvent('MainMenuHideBackgroundImage', 1);
$.DefineEvent('MainMenuShowBackgroundMovie', 1);
$.DefineEvent('MainMenuHideBackgroundMovie', 0);
$.DefineEvent('MainMenuHideNav', 1);
$.DefineEvent('MainMenuShowNav', 1);
$.DefineEvent('MainMenuAddBgPanel', 1);
$.DefineEvent('MainMenuAnimatedSwitch', 1);
$.DefineEvent('LoadingScreenClearLastMap', 0);
$.DefineEvent('MainMenuModeRequestCleanup', 0);
$.DefineEvent('MainMenuPageClosed', 2);
$.DefineEvent('CampaignMenuRefreshUserSettings', 0);
$.DefineEvent('ReloadCCSettings', 0);
