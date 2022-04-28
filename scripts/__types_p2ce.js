/**** Panorama JS Types ****/
// This file is meant to provide JS typing information for Panorama Panels and APIs. It is by no means usable as actual code.
// Having the file open in VS Code will automatically pull in the types all other open JS files.
// If VS Code (or your editor of choice) does not automatically pick up the types, you can `require` it in JS files for development, but that will error in game.
//
// For typing information for specific panel types, you can use JSDoc on fetching panels via `$()`
// Eg:
//// /** @type {ProgressBar} @static */
//// progressBarPanel = $('#ProgressBarPanelID');
//

/**
 * @typedef {*} unknown
 */
/**
 * @typedef {*} js_raw_arg
 */
/**
 * @typedef {number} int16
 */
/**
 * @typedef {number} uint16
 */
/**
 * @typedef {number} int32
 */
/**
 * @typedef {number} uint32
 */
/**
 * @typedef {number} int64
 */
/**
 * @typedef {number} uint64
 */
/**
 * @typedef {number} float
 */
/**
 * @typedef {string} cstring
 */


/** @namespace */
let $ = {}
/** @namespace */
$.persistentStorage = {}
{
/** @type {int32} @readonly */
let length;
$.persistentStorage.length = length;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let AsyncWebRequest = function(...js_raw_arg) {}
$.AsyncWebRequest = AsyncWebRequest;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let CancelScheduled = function(...js_raw_arg) {}
$.CancelScheduled = CancelScheduled;
}
{
/**
 * @static
 */
let clear = function() {}
$.persistentStorage.clear = clear;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let CreatePanel = function(...js_raw_arg) {}
$.CreatePanel = CreatePanel;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let DbgIsReloadingScript = function(...js_raw_arg) {}
$.DbgIsReloadingScript = DbgIsReloadingScript;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let DefineEvent = function(...js_raw_arg) {}
$.DefineEvent = DefineEvent;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let DefinePanelEvent = function(...js_raw_arg) {}
$.DefinePanelEvent = DefinePanelEvent;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let DispatchEvent = function(...js_raw_arg) {}
$.DispatchEvent = DispatchEvent;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let DispatchEventAsync = function(...js_raw_arg) {}
$.DispatchEventAsync = DispatchEventAsync;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let Each = function(...js_raw_arg) {}
$.Each = Each;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let FindChildInContext = function(...js_raw_arg) {}
$.FindChildInContext = FindChildInContext;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let GetContextPanel = function(...js_raw_arg) {}
$.GetContextPanel = GetContextPanel;
}
{
/**
 * @static
 * @returns {cstring}
 * @param {cstring} keyName
 */
let getItem = function(keyName) {}
$.persistentStorage.getItem = getItem;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let HTMLEscape = function(...js_raw_arg) {}
$.HTMLEscape = HTMLEscape;
}
{
/**
 * @static
 * @returns {cstring}
 * @param {int32} n
 */
let key = function(n) {}
$.persistentStorage.key = key;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let Language = function(...js_raw_arg) {}
$.Language = Language;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let LoadKeyValuesFile = function(...js_raw_arg) {}
$.LoadKeyValuesFile = LoadKeyValuesFile;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let Localize = function(...js_raw_arg) {}
$.Localize = Localize;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let LocalizeSafe = function(...js_raw_arg) {}
$.LocalizeSafe = LocalizeSafe;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let Msg = function(...js_raw_arg) {}
$.Msg = Msg;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let PlaySoundEvent = function(...js_raw_arg) {}
$.PlaySoundEvent = PlaySoundEvent;
}
{
/**
 * @static
 * @param {('AddItemToCart'|'AsyncEvent'|'CapabilityPopupIsOpen'|'ChaosHudProcessInput'|'ChaosHudThink'|'CloseAcceptPopup'|'CloseSubMenuContent'|'DbgTestHudVote'|'DemoPlaybackControl'|'EndOfMatch_GetFreeForAllPlayerPosition_Response'|'EndOfMatch_GetFreeForAllTopThreePlayers_Response'|'EndOfMatch_ShowNext'|'FriendInvitedFromContextMenu'|'HideContentPanel'|'HideSelectItemForCapabilityPopup'|'InitAvatar'|'InitializeTournamentsPage'|'InventoryItemPreview'|'LayoutReloaded'|'LootlistItemPreview'|'MainMenuTabShown'|'NavigateToTab'|'OpenInventory'|'OpenPlayMenu'|'OpenSidebarPanel'|'OpenWatchMenu'|'PageDown'|'PageLeft'|'PageRight'|'PageUp'|'PanoramaGameTimeJumpEvent'|'RefreshActiveInventoryList'|'RefreshPickemPage'|'RemoveItemFromCart'|'Scoreboard_CycleStats'|'Scoreboard_GetFreeForAllPlayerPosition'|'Scoreboard_GetFreeForAllTopThreePlayers'|'Scoreboard_SetMuteAbusive'|'Scoreboard_UnborrowMusicKit'|'ScrollDown'|'ScrollLeft'|'ScrollRight'|'ScrollUp'|'ShowAcceptPopup'|'ShowAcknowledgePopup'|'ShowActiveTournamentPage'|'ShowCenterPrintText'|'ShowContentPanel'|'ShowDeleteItemConfirmationPopup'|'ShowLoadoutForItem'|'ShowResetMusicVolumePopup'|'ShowSelectItemForCapabilityPopup'|'ShowTournamentStore'|'ShowTradeUpPanel'|'ShowUseItemOnceConfirmationPopup'|'ShowVoteContextMenu'|'SidebarContextMenuActive'|'SidebarIsCollapsed'|'StartDecodeableAnim'|'StaticHudMenu_EntrySelected'|'StreamPanelClosed'|'UpdateTradeUpPanel'|'UpdateVanityModelData')} event_name
 * @param {js_raw_arg} 
 */
let RegisterEventHandler = function(event_name, ...js_raw_arg) {}
$.RegisterEventHandler = RegisterEventHandler;
}
{
/**
 * @static
 * @param {('AddItemToCart'|'AsyncEvent'|'CapabilityPopupIsOpen'|'ChaosHudProcessInput'|'ChaosHudThink'|'CloseAcceptPopup'|'CloseSubMenuContent'|'DbgTestHudVote'|'DemoPlaybackControl'|'EndOfMatch_GetFreeForAllPlayerPosition_Response'|'EndOfMatch_GetFreeForAllTopThreePlayers_Response'|'EndOfMatch_ShowNext'|'FriendInvitedFromContextMenu'|'HideContentPanel'|'HideSelectItemForCapabilityPopup'|'InitAvatar'|'InitializeTournamentsPage'|'InventoryItemPreview'|'LayoutReloaded'|'LootlistItemPreview'|'MainMenuTabShown'|'NavigateToTab'|'OpenInventory'|'OpenPlayMenu'|'OpenSidebarPanel'|'OpenWatchMenu'|'PageDown'|'PageLeft'|'PageRight'|'PageUp'|'PanoramaGameTimeJumpEvent'|'RefreshActiveInventoryList'|'RefreshPickemPage'|'RemoveItemFromCart'|'Scoreboard_CycleStats'|'Scoreboard_GetFreeForAllPlayerPosition'|'Scoreboard_GetFreeForAllTopThreePlayers'|'Scoreboard_SetMuteAbusive'|'Scoreboard_UnborrowMusicKit'|'ScrollDown'|'ScrollLeft'|'ScrollRight'|'ScrollUp'|'ShowAcceptPopup'|'ShowAcknowledgePopup'|'ShowActiveTournamentPage'|'ShowCenterPrintText'|'ShowContentPanel'|'ShowDeleteItemConfirmationPopup'|'ShowLoadoutForItem'|'ShowResetMusicVolumePopup'|'ShowSelectItemForCapabilityPopup'|'ShowTournamentStore'|'ShowTradeUpPanel'|'ShowUseItemOnceConfirmationPopup'|'ShowVoteContextMenu'|'SidebarContextMenuActive'|'SidebarIsCollapsed'|'StartDecodeableAnim'|'StaticHudMenu_EntrySelected'|'StreamPanelClosed'|'UpdateTradeUpPanel'|'UpdateVanityModelData')} event_name
 * @param {js_raw_arg} 
 */
let RegisterForUnhandledEvent = function(event_name, ...js_raw_arg) {}
$.RegisterForUnhandledEvent = RegisterForUnhandledEvent;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let RegisterKeyBind = function(...js_raw_arg) {}
$.RegisterKeyBind = RegisterKeyBind;
}
{
/**
 * @static
 * @param {cstring} keyName
 */
let removeItem = function(keyName) {}
$.persistentStorage.removeItem = removeItem;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let Schedule = function(...js_raw_arg) {}
$.Schedule = Schedule;
}
{
/**
 * @static
 * @param {cstring} keyName
 * @param {cstring} keyValue
 */
let setItem = function(keyName, keyValue) {}
$.persistentStorage.setItem = setItem;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let StopSoundEvent = function(...js_raw_arg) {}
$.StopSoundEvent = StopSoundEvent;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let UnregisterEventHandler = function(...js_raw_arg) {}
$.UnregisterEventHandler = UnregisterEventHandler;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let UnregisterForUnhandledEvent = function(...js_raw_arg) {}
$.UnregisterForUnhandledEvent = UnregisterForUnhandledEvent;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let UrlDecode = function(...js_raw_arg) {}
$.UrlDecode = UrlDecode;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let UrlEncode = function(...js_raw_arg) {}
$.UrlEncode = UrlEncode;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let Warning = function(...js_raw_arg) {}
$.Warning = Warning;
}
/** @namespace */
let FriendsAPI = {}
{
/**
 * @static
 * @returns {cstring}
 */
let GetLocalPlayerName = function() {}
FriendsAPI.GetLocalPlayerName = GetLocalPlayerName;
}
{
/**
 * @static
 * @returns {cstring}
 * @param {uint64} xuid
 */
let GetNameForXUID = function(xuid) {}
FriendsAPI.GetNameForXUID = GetNameForXUID;
}
/** @namespace */
let GameInterfaceAPI = {}
{
/**
 * @static
 * @param {cstring} 
 */
let ConsoleCommand = function(cstring) {}
GameInterfaceAPI.ConsoleCommand = ConsoleCommand;
}
{
/**
 * @static
 * @returns {bool}
 * @param {cstring} 
 */
let GetSettingBool = function(cstring) {}
GameInterfaceAPI.GetSettingBool = GetSettingBool;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} 
 */
let GetSettingColor = function(cstring) {}
GameInterfaceAPI.GetSettingColor = GetSettingColor;
}
{
/**
 * @static
 * @returns {float}
 * @param {cstring} 
 */
let GetSettingFloat = function(cstring) {}
GameInterfaceAPI.GetSettingFloat = GetSettingFloat;
}
{
/**
 * @static
 * @returns {int32}
 * @param {cstring} 
 */
let GetSettingInt = function(cstring) {}
GameInterfaceAPI.GetSettingInt = GetSettingInt;
}
{
/**
 * @static
 * @returns {cstring}
 * @param {cstring} 
 */
let GetSettingString = function(cstring) {}
GameInterfaceAPI.GetSettingString = GetSettingString;
}
{
/**
 * @static
 * @returns {uint32}
 * @param {cstring} event_name
 * @param {unknown} callback
 */
let RegisterGameEventHandler = function(event_name, callback) {}
GameInterfaceAPI.RegisterGameEventHandler = RegisterGameEventHandler;
}
{
/**
 * @static
 * @param {cstring} 
 * @param {bool} 
 */
let SetSettingBool = function(cstring, bool) {}
GameInterfaceAPI.SetSettingBool = SetSettingBool;
}
{
/**
 * @static
 * @param {cstring} 
 * @param {unknown} 
 */
let SetSettingColor = function(cstring, unknown) {}
GameInterfaceAPI.SetSettingColor = SetSettingColor;
}
{
/**
 * @static
 * @param {cstring} 
 * @param {float} 
 */
let SetSettingFloat = function(cstring, float) {}
GameInterfaceAPI.SetSettingFloat = SetSettingFloat;
}
{
/**
 * @static
 * @param {cstring} 
 * @param {int32} 
 */
let SetSettingInt = function(cstring, int32) {}
GameInterfaceAPI.SetSettingInt = SetSettingInt;
}
{
/**
 * @static
 * @param {cstring} 
 * @param {cstring} 
 */
let SetSettingString = function(cstring, cstring) {}
GameInterfaceAPI.SetSettingString = SetSettingString;
}
{
/**
 * @static
 * @param {uint32} callback_id
 */
let UnregisterGameEventHandler = function(callback_id) {}
GameInterfaceAPI.UnregisterGameEventHandler = UnregisterGameEventHandler;
}
/** @namespace */
let RichPresenceAPI = {}
{
/**
 * @static
 */
let Clear = function() {}
RichPresenceAPI.Clear = Clear;
}
{
/**
 * @static
 * @param {unknown} key_values_object
 */
let UpdateRichPresenceState = function(key_values_object) {}
RichPresenceAPI.UpdateRichPresenceState = UpdateRichPresenceState;
}
/** @namespace */
let SteamOverlayAPI = {}
{
/**
 * @static
 * @param {cstring} profileID
 */
let OpenToProfileID = function(profileID) {}
SteamOverlayAPI.OpenToProfileID = OpenToProfileID;
}
{
/**
 * @static
 * @param {cstring} url
 */
let OpenURL = function(url) {}
SteamOverlayAPI.OpenURL = OpenURL;
}
{
/**
 * @static
 * @param {cstring} url
 */
let OpenURLModal = function(url) {}
SteamOverlayAPI.OpenURLModal = OpenURLModal;
}
/** @namespace */
let UiToolkitAPI = {}
{
/**
 * @static
 * @returns {uint64}
 * @param {unknown} panelPtr
 * @param {cstring} strDebugContextName
 */
let AddDenyAllInputToGame = function(panelPtr, strDebugContextName) {}
UiToolkitAPI.AddDenyAllInputToGame = AddDenyAllInputToGame;
}
{
/**
 * @static
 * @returns {uint64}
 * @param {unknown} panelPtr
 * @param {cstring} strDebugContextName
 */
let AddDenyMouseInputToGame = function(panelPtr, strDebugContextName) {}
UiToolkitAPI.AddDenyMouseInputToGame = AddDenyMouseInputToGame;
}
{
/**
 * @static
 */
let CloseAllVisiblePopups = function() {}
UiToolkitAPI.CloseAllVisiblePopups = CloseAllVisiblePopups;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let GetGlobalObject = function(...js_raw_arg) {}
UiToolkitAPI.GetGlobalObject = GetGlobalObject;
}
{
/**
 * @static
 * @param {cstring} tooltipID
 */
let HideCustomLayoutTooltip = function(tooltipID) {}
UiToolkitAPI.HideCustomLayoutTooltip = HideCustomLayoutTooltip;
}
{
/**
 * @static
 */
let HideTextTooltip = function() {}
UiToolkitAPI.HideTextTooltip = HideTextTooltip;
}
{
/**
 * @static
 */
let HideTitleImageTextTooltip = function() {}
UiToolkitAPI.HideTitleImageTextTooltip = HideTitleImageTextTooltip;
}
{
/**
 * @static
 */
let HideTitleTextTooltip = function() {}
UiToolkitAPI.HideTitleTextTooltip = HideTitleTextTooltip;
}
{
/**
 * @static
 * @param {js_raw_arg} 
 */
let InvokeJSCallback = function(...js_raw_arg) {}
UiToolkitAPI.InvokeJSCallback = InvokeJSCallback;
}
{
/**
 * @static
 * @returns {bool}
 */
let IsPanoramaInECOMode = function() {}
UiToolkitAPI.IsPanoramaInECOMode = IsPanoramaInECOMode;
}
{
/**
 * @static
 * @returns {cstring}
 * @param {cstring} str
 */
let MakeStringSafe = function(str) {}
UiToolkitAPI.MakeStringSafe = MakeStringSafe;
}
{
/**
 * @static
 * @param {cstring} tagName
 */
let ProfilingScopeBegin = function(tagName) {}
UiToolkitAPI.ProfilingScopeBegin = ProfilingScopeBegin;
}
{
/**
 * @static
 * @returns {double}
 */
let ProfilingScopeEnd = function() {}
UiToolkitAPI.ProfilingScopeEnd = ProfilingScopeEnd;
}
{
/**
 * @static
 * @param {cstring} panelTypeName
 * @param {cstring} layoutFile
 */
let RegisterHUDPanel2d = function(panelTypeName, layoutFile) {}
UiToolkitAPI.RegisterHUDPanel2d = RegisterHUDPanel2d;
}
{
/**
 * @static
 * @returns {int32}
 * @param {unknown} jsCallbackFunc
 */
let RegisterJSCallback = function(jsCallbackFunc) {}
UiToolkitAPI.RegisterJSCallback = RegisterJSCallback;
}
{
/**
 * @static
 * @param {cstring} panelTypeName
 * @param {cstring} layoutFile
 */
let RegisterPanel2d = function(panelTypeName, layoutFile) {}
UiToolkitAPI.RegisterPanel2d = RegisterPanel2d;
}
{
/**
 * @static
 * @param {uint64} handle
 */
let ReleaseDenyAllInputToGame = function(handle) {}
UiToolkitAPI.ReleaseDenyAllInputToGame = ReleaseDenyAllInputToGame;
}
{
/**
 * @static
 * @param {uint64} handle
 */
let ReleaseDenyMouseInputToGame = function(handle) {}
UiToolkitAPI.ReleaseDenyMouseInputToGame = ReleaseDenyMouseInputToGame;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} targetPanelID
 * @param {cstring} contentmenuID
 * @param {cstring} layoutFile
 */
let ShowCustomLayoutContextMenu = function(targetPanelID, contentmenuID, layoutFile) {}
UiToolkitAPI.ShowCustomLayoutContextMenu = ShowCustomLayoutContextMenu;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} targetPanelID
 * @param {cstring} contentmenuID
 * @param {cstring} layoutFile
 * @param {cstring} parameters
 */
let ShowCustomLayoutContextMenuParameters = function(targetPanelID, contentmenuID, layoutFile, parameters) {}
UiToolkitAPI.ShowCustomLayoutContextMenuParameters = ShowCustomLayoutContextMenuParameters;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} targetPanelID
 * @param {cstring} contentmenuID
 * @param {cstring} layoutFile
 * @param {cstring} parameters
 * @param {unknown} dismissJsFunc
 */
let ShowCustomLayoutContextMenuParametersDismissEvent = function(targetPanelID, contentmenuID, layoutFile, parameters, dismissJsFunc) {}
UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent = ShowCustomLayoutContextMenuParametersDismissEvent;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} tooltipID
 * @param {cstring} layoutFile
 * @param {cstring} parameters
 */
let ShowCustomLayoutParametersTooltip = function(targetPanelID, tooltipID, layoutFile, parameters) {}
UiToolkitAPI.ShowCustomLayoutParametersTooltip = ShowCustomLayoutParametersTooltip;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} tooltipID
 * @param {cstring} layoutFile
 * @param {cstring} parameters
 * @param {cstring} style
 */
let ShowCustomLayoutParametersTooltipStyled = function(targetPanelID, tooltipID, layoutFile, parameters, style) {}
UiToolkitAPI.ShowCustomLayoutParametersTooltipStyled = ShowCustomLayoutParametersTooltipStyled;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} popupID
 * @param {cstring} layoutFile
 */
let ShowCustomLayoutPopup = function(popupID, layoutFile) {}
UiToolkitAPI.ShowCustomLayoutPopup = ShowCustomLayoutPopup;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} popupID
 * @param {cstring} layoutFile
 * @param {cstring} parameters
 */
let ShowCustomLayoutPopupParameters = function(popupID, layoutFile, parameters) {}
UiToolkitAPI.ShowCustomLayoutPopupParameters = ShowCustomLayoutPopupParameters;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} tooltipID
 * @param {cstring} layoutFile
 */
let ShowCustomLayoutTooltip = function(targetPanelID, tooltipID, layoutFile) {}
UiToolkitAPI.ShowCustomLayoutTooltip = ShowCustomLayoutTooltip;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} tooltipID
 * @param {cstring} layoutFile
 * @param {cstring} style
 */
let ShowCustomLayoutTooltipStyled = function(targetPanelID, tooltipID, layoutFile, style) {}
UiToolkitAPI.ShowCustomLayoutTooltipStyled = ShowCustomLayoutTooltipStyled;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 */
let ShowGenericPopup = function(title, message, style) {}
UiToolkitAPI.ShowGenericPopup = ShowGenericPopup;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {cstring} bgStyle
 */
let ShowGenericPopupBgStyle = function(title, message, style, bgStyle) {}
UiToolkitAPI.ShowGenericPopupBgStyle = ShowGenericPopupBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} cancelJSFunc
 */
let ShowGenericPopupCancel = function(title, message, style, cancelJSFunc) {}
UiToolkitAPI.ShowGenericPopupCancel = ShowGenericPopupCancel;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} cancelJSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupCancelBgStyle = function(title, message, style, cancelJSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupCancelBgStyle = ShowGenericPopupCancelBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} okJSFunc
 */
let ShowGenericPopupOk = function(title, message, style, okJSFunc) {}
UiToolkitAPI.ShowGenericPopupOk = ShowGenericPopupOk;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} okJSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupOkBgStyle = function(title, message, style, okJSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupOkBgStyle = ShowGenericPopupOkBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} okJSFunc
 * @param {unknown} cancelJSFunc
 */
let ShowGenericPopupOkCancel = function(title, message, style, okJSFunc, cancelJSFunc) {}
UiToolkitAPI.ShowGenericPopupOkCancel = ShowGenericPopupOkCancel;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} okJSFunc
 * @param {unknown} cancelJSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupOkCancelBgStyle = function(title, message, style, okJSFunc, cancelJSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupOkCancelBgStyle = ShowGenericPopupOkCancelBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {cstring} optionName
 * @param {unknown} optionJSFunc
 */
let ShowGenericPopupOneOption = function(title, message, style, optionName, optionJSFunc) {}
UiToolkitAPI.ShowGenericPopupOneOption = ShowGenericPopupOneOption;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {cstring} optionName
 * @param {unknown} optionJSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupOneOptionBgStyle = function(title, message, style, optionName, optionJSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupOneOptionBgStyle = ShowGenericPopupOneOptionBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {cstring} option1Name
 * @param {unknown} option1JSFunc
 * @param {cstring} option2Name
 * @param {unknown} option2JSFunc
 * @param {cstring} option3Name
 * @param {unknown} option3JSFunc
 */
let ShowGenericPopupThreeOptions = function(title, message, style, option1Name, option1JSFunc, option2Name, option2JSFunc, option3Name, option3JSFunc) {}
UiToolkitAPI.ShowGenericPopupThreeOptions = ShowGenericPopupThreeOptions;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {cstring} option1Name
 * @param {unknown} option1JSFunc
 * @param {cstring} option2Name
 * @param {unknown} option2JSFunc
 * @param {cstring} option3Name
 * @param {unknown} option3JSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupThreeOptionsBgStyle = function(title, message, style, option1Name, option1JSFunc, option2Name, option2JSFunc, option3Name, option3JSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupThreeOptionsBgStyle = ShowGenericPopupThreeOptionsBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {cstring} option1Name
 * @param {unknown} option1JSFunc
 * @param {cstring} option2Name
 * @param {unknown} option2JSFunc
 */
let ShowGenericPopupTwoOptions = function(title, message, style, option1Name, option1JSFunc, option2Name, option2JSFunc) {}
UiToolkitAPI.ShowGenericPopupTwoOptions = ShowGenericPopupTwoOptions;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {cstring} option1Name
 * @param {unknown} option1JSFunc
 * @param {cstring} option2Name
 * @param {unknown} option2JSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupTwoOptionsBgStyle = function(title, message, style, option1Name, option1JSFunc, option2Name, option2JSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle = ShowGenericPopupTwoOptionsBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} yesJSFunc
 * @param {unknown} noJSFunc
 */
let ShowGenericPopupYesNo = function(title, message, style, yesJSFunc, noJSFunc) {}
UiToolkitAPI.ShowGenericPopupYesNo = ShowGenericPopupYesNo;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} yesJSFunc
 * @param {unknown} noJSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupYesNoBgStyle = function(title, message, style, yesJSFunc, noJSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupYesNoBgStyle = ShowGenericPopupYesNoBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} yesJSFunc
 * @param {unknown} noJSFunc
 * @param {unknown} cancelJSFunc
 */
let ShowGenericPopupYesNoCancel = function(title, message, style, yesJSFunc, noJSFunc, cancelJSFunc) {}
UiToolkitAPI.ShowGenericPopupYesNoCancel = ShowGenericPopupYesNoCancel;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} title
 * @param {cstring} message
 * @param {cstring} style
 * @param {unknown} yesJSFunc
 * @param {unknown} noJSFunc
 * @param {unknown} cancelJSFunc
 * @param {cstring} bgStyle
 */
let ShowGenericPopupYesNoCancelBgStyle = function(title, message, style, yesJSFunc, noJSFunc, cancelJSFunc, bgStyle) {}
UiToolkitAPI.ShowGenericPopupYesNoCancelBgStyle = ShowGenericPopupYesNoCancelBgStyle;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} popupID
 * @param {cstring} layoutFile
 */
let ShowGlobalCustomLayoutPopup = function(popupID, layoutFile) {}
UiToolkitAPI.ShowGlobalCustomLayoutPopup = ShowGlobalCustomLayoutPopup;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} popupID
 * @param {cstring} layoutFile
 * @param {cstring} parameters
 */
let ShowGlobalCustomLayoutPopupParameters = function(popupID, layoutFile, parameters) {}
UiToolkitAPI.ShowGlobalCustomLayoutPopupParameters = ShowGlobalCustomLayoutPopupParameters;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} targetPanelID
 * @param {cstring} contentmenuID
 * @param {unknown} items
 */
let ShowSimpleContextMenu = function(targetPanelID, contentmenuID, items) {}
UiToolkitAPI.ShowSimpleContextMenu = ShowSimpleContextMenu;
}
{
/**
 * @static
 * @returns {unknown}
 * @param {cstring} targetPanelID
 * @param {cstring} contentmenuID
 * @param {unknown} items
 * @param {unknown} dismissJsFunc
 */
let ShowSimpleContextMenuWithDismissEvent = function(targetPanelID, contentmenuID, items, dismissJsFunc) {}
UiToolkitAPI.ShowSimpleContextMenuWithDismissEvent = ShowSimpleContextMenuWithDismissEvent;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} text
 */
let ShowTextTooltip = function(targetPanelID, text) {}
UiToolkitAPI.ShowTextTooltip = ShowTextTooltip;
}
{
/**
 * @static
 * @param {unknown} targetPanel
 * @param {cstring} text
 */
let ShowTextTooltipOnPanel = function(targetPanel, text) {}
UiToolkitAPI.ShowTextTooltipOnPanel = ShowTextTooltipOnPanel;
}
{
/**
 * @static
 * @param {unknown} targetPanel
 * @param {cstring} text
 * @param {cstring} style
 */
let ShowTextTooltipOnPanelStyled = function(targetPanel, text, style) {}
UiToolkitAPI.ShowTextTooltipOnPanelStyled = ShowTextTooltipOnPanelStyled;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} text
 * @param {cstring} style
 */
let ShowTextTooltipStyled = function(targetPanelID, text, style) {}
UiToolkitAPI.ShowTextTooltipStyled = ShowTextTooltipStyled;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} title
 * @param {cstring} image
 * @param {cstring} text
 */
let ShowTitleImageTextTooltip = function(targetPanelID, title, image, text) {}
UiToolkitAPI.ShowTitleImageTextTooltip = ShowTitleImageTextTooltip;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} title
 * @param {cstring} image
 * @param {cstring} text
 * @param {cstring} style
 */
let ShowTitleImageTextTooltipStyled = function(targetPanelID, title, image, text, style) {}
UiToolkitAPI.ShowTitleImageTextTooltipStyled = ShowTitleImageTextTooltipStyled;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} title
 * @param {cstring} text
 */
let ShowTitleTextTooltip = function(targetPanelID, title, text) {}
UiToolkitAPI.ShowTitleTextTooltip = ShowTitleTextTooltip;
}
{
/**
 * @static
 * @param {cstring} targetPanelID
 * @param {cstring} title
 * @param {cstring} text
 * @param {cstring} style
 */
let ShowTitleTextTooltipStyled = function(targetPanelID, title, text, style) {}
UiToolkitAPI.ShowTitleTextTooltipStyled = ShowTitleTextTooltipStyled;
}
{
/**
 * @static
 * @param {int32} jsCallbackHandle
 */
let UnregisterJSCallback = function(jsCallbackHandle) {}
UiToolkitAPI.UnregisterJSCallback = UnregisterJSCallback;
}
/** @namespace */
let UserAPI = {}
{
/**
 * @static
 * @returns {uint64}
 */
let GetXUID = function() {}
UserAPI.GetXUID = GetXUID;
}
/** @class */
function Button() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function ChaosBackbufferImagePanel() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function ChaosLoadingScreen() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function ChaosMainMenu() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsMultiplayer = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function ChaosSettingsSlider() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.convar;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {float}  */
this.max;
/** @type {float}  */
this.min;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {float}  */
this.value;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @returns {float}
 */
this.ActualValue = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 */
this.OnShow = function() {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 */
this.RestoreCVarDefault = function() {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function Frame() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {cstring} 
 */
this.SetSnippet = function(cstring) {}
/**
 * @param {cstring} 
 */
this.SetSource = function(cstring) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function Image() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetImage = function(cstring) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {cstring} 
 */
this.SetScaling = function(cstring) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function Movie() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsAdjustingVolume = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 */
this.Pause = function() {}
/**
 */
this.Play = function() {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 */
this.SetControls = function(cstring) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {cstring} 
 */
this.SetMovie = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {float} 
 */
this.SetPlaybackVolume = function(float) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetRepeat = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {cstring} 
 */
this.SetSound = function(cstring) {}
/**
 * @param {cstring} 
 */
this.SetTitle = function(cstring) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 */
this.Stop = function() {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function Panel() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function ProgressBar() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {float}  */
this.max;
/** @type {float}  */
this.min;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {float}  */
this.value;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function ResizeDragKnob() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {bool}  */
this.horizontalDrag;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {unknown} @readonly */
this.target;
/** @type {bool}  */
this.verticalDrag;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function StaticConsoleMessageTarget() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
/** @class */
function ToggleButton() {
/** @type {bool}  */
this.activationenabled;
/** @type {float} @readonly */
this.actuallayoutheight;
/** @type {float} @readonly */
this.actuallayoutwidth;
/** @type {float} @readonly */
this.actualuiscale_x;
/** @type {float} @readonly */
this.actualuiscale_y;
/** @type {float} @readonly */
this.actualxoffset;
/** @type {float} @readonly */
this.actualyoffset;
/** @type {bool}  */
this.checked;
/** @type {float} @readonly */
this.contentheight;
/** @type {float} @readonly */
this.contentwidth;
/** @type {cstring}  */
this.defaultfocus;
/** @type {float} @readonly */
this.desiredlayoutheight;
/** @type {float} @readonly */
this.desiredlayoutwidth;
/** @type {bool}  */
this.enabled;
/** @type {bool}  */
this.hittest;
/** @type {bool}  */
this.hittestchildren;
/** @type {cstring} @readonly */
this.id;
/** @type {cstring}  */
this.inputnamespace;
/** @type {cstring} @readonly */
this.layoutfile;
/** @type {cstring} @readonly */
this.paneltype;
/** @type {bool}  */
this.rememberchildfocus;
/** @type {float} @readonly */
this.scrolloffset_x;
/** @type {float} @readonly */
this.scrolloffset_y;
/** @type {float}  */
this.selectionpos_x;
/** @type {float}  */
this.selectionpos_y;
/** @type {unknown} @readonly */
this.style;
/** @type {float}  */
this.tabindex;
/** @type {cstring}  */
this.text;
/** @type {bool}  */
this.visible;
/**
 * @returns {bool}
 */
this.AcceptsFocus = function() {}
/**
 * @returns {bool}
 */
this.AcceptsInput = function() {}
/**
 * @param {cstring} 
 */
this.AddClass = function(cstring) {}
/**
 * @param {bool} 
 */
this.ApplyStyles = function(bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.BAscendantHasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.CanSeeInParentScroll = function() {}
/**
 * @returns {unknown}
 */
this.Children = function() {}
/**
 * @param {cstring} 
 */
this.ClearPanelEvent = function(cstring) {}
/**
 * @param {unknown} 
 */
this.ClearPropertyFromCode = function(unknown) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.CreateChildren = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.CreateCopyOfCSSKeyframes = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.Data = function(...js_raw_arg) {}
/**
 * @param {float} 
 */
this.DeleteAsync = function(float) {}
/**
 * @param {unknown} 
 */
this.DeleteKeyframes = function(unknown) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChild = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildInLayoutFile = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildrenWithClassTraverse = function(cstring) {}
/**
 * @returns {unknown}
 * @param {cstring} 
 */
this.FindChildTraverse = function(cstring) {}
/**
 * @returns {int32}
 * @param {cstring} 
 * @param {int32} 
 */
this.GetAttributeInt = function(cstring, int32) {}
/**
 * @returns {cstring}
 * @param {cstring} 
 * @param {cstring} 
 */
this.GetAttributeString = function(cstring, cstring) {}
/**
 * @returns {uint32}
 * @param {cstring} 
 * @param {uint32} 
 */
this.GetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @returns {unknown}
 * @param {int32} 
 */
this.GetChild = function(int32) {}
/**
 * @returns {int32}
 */
this.GetChildCount = function() {}
/**
 * @returns {int32}
 * @param {unknown} 
 */
this.GetChildIndex = function(unknown) {}
/**
 * @returns {unknown}
 */
this.GetFirstChild = function() {}
/**
 * @returns {unknown}
 */
this.GetLastChild = function() {}
/**
 * @returns {unknown}
 */
this.GetParent = function() {}
/**
 * @returns {unknown}
 */
this.GetPositionWithinWindow = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.HasClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.HasDescendantKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.HasHoverStyle = function() {}
/**
 * @returns {bool}
 */
this.HasKeyFocus = function() {}
/**
 * @returns {bool}
 */
this.IsDraggable = function() {}
/**
 * @returns {bool}
 */
this.IsReadyForDisplay = function() {}
/**
 * @returns {bool}
 */
this.IsSelected = function() {}
/**
 * @returns {bool}
 */
this.IsTransparent = function() {}
/**
 * @returns {bool}
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayout = function(cstring, bool, bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutAsync = function(cstring, bool, bool) {}
/**
 * @param {js_raw_arg} 
 */
this.LoadLayoutFromString = function(...js_raw_arg) {}
/**
 * @param {cstring} 
 * @param {bool} 
 * @param {bool} 
 */
this.LoadLayoutFromStringAsync = function(cstring, bool, bool) {}
/**
 * @returns {bool}
 * @param {cstring} 
 */
this.LoadLayoutSnippet = function(cstring) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildAfter = function(unknown, unknown) {}
/**
 * @param {unknown} 
 * @param {unknown} 
 */
this.MoveChildBefore = function(unknown, unknown) {}
/**
 * @param {bool} 
 */
this.RegisterForReadyEvents = function(bool) {}
/**
 */
this.RemoveAndDeleteChildren = function() {}
/**
 * @param {cstring} 
 */
this.RemoveClass = function(cstring) {}
/**
 * @returns {bool}
 */
this.ScrollParentToFitWhenFocused = function() {}
/**
 * @param {unknown} 
 * @param {bool} 
 */
this.ScrollParentToMakePanelFit = function(unknown, bool) {}
/**
 */
this.ScrollToBottom = function() {}
/**
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {float} 
 * @param {unknown} 
 * @param {bool} 
 * @param {bool} 
 */
this.ScrollToFitRegion = function(float, float, float, float, unknown, bool, bool) {}
/**
 */
this.ScrollToLeftEdge = function() {}
/**
 */
this.ScrollToRightEdge = function() {}
/**
 */
this.ScrollToTop = function() {}
/**
 * @param {bool} 
 */
this.SetAcceptsFocus = function(bool) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetAttributeInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetAttributeString = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {uint32} 
 */
this.SetAttributeUInt32 = function(cstring, uint32) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SetDialogVariable = function(cstring, cstring) {}
/**
 * @param {cstring} 
 * @param {float} 
 */
this.SetDialogVariableFloat = function(cstring, float) {}
/**
 * @param {cstring} 
 * @param {int32} 
 */
this.SetDialogVariableInt = function(cstring, int32) {}
/**
 * @param {cstring} 
 * @param {int64} 
 */
this.SetDialogVariableTime = function(cstring, int64) {}
/**
 * @param {bool} 
 */
this.SetDisableFocusOnMouseDown = function(bool) {}
/**
 * @param {bool} 
 */
this.SetDraggable = function(bool) {}
/**
 * @returns {bool}
 */
this.SetFocus = function() {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SetHasClass = function(cstring, bool) {}
/**
 * @param {cstring} 
 */
this.SetInputNamespace = function(cstring) {}
/**
 * @param {js_raw_arg} 
 */
this.SetPanelEvent = function(...js_raw_arg) {}
/**
 * @param {unknown} 
 */
this.SetParent = function(unknown) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetReadyForDisplay = function(bool) {}
/**
 * @param {bool} 
 */
this.SetScrollParentToFitWhenFocused = function(bool) {}
/**
 * @param {bool} 
 */
this.SetSelected = function(bool) {}
/**
 * @param {bool} 
 */
this.SetTopOfInputContext = function(bool) {}
/**
 * @param {cstring} 
 * @param {bool} 
 */
this.SortChildrenOnAttribute = function(cstring, bool) {}
/**
 * @param {cstring} 
 * @param {cstring} 
 */
this.SwitchClass = function(cstring, cstring) {}
/**
 * @param {cstring} 
 */
this.ToggleClass = function(cstring) {}
/**
 * @param {cstring} 
 */
this.TriggerClass = function(cstring) {}
/**
 * @param {unknown} 
 */
this.UpdateCurrentAnimationKeyframes = function(unknown) {}
/**
 * @returns {bool}
 */
this.UpdateFocusInContext = function() {}
}
