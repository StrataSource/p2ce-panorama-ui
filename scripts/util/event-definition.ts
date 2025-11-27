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

$.DefineEvent('MainMenuOpenNestedPage', 5);
