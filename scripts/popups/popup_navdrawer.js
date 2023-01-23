/* eslint-disable no-unused-vars */

"use strict";

function SetupPopup() {
	const strPopupValue = $.GetContextPanel().GetAttributeString("popupvalue", "(not found)");
	$.GetContextPanel().SetDialogVariable("popupvalue", strPopupValue);
}

function OnOKPressed() {
	// Run some js code
	$.Msg("OnComplexPressed: Running from 'popup custom layout'\n");

	// Invoke callback set up in the parent panel (if set)
	const callbackHandle = $.GetContextPanel().GetAttributeInt("callback", -1);
	if (callbackHandle !== -1) {
		UiToolkitAPI.InvokeJSCallback(callbackHandle, "OK");
	}

	// Do not forget to dispatch the UIPopupButtonClicked() panorama event
	// responsible for closing the popup
	$.DispatchEvent("UIPopupButtonClicked", "");
}

function OnQuitButtonPressed() {
	UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
		"Confirm Exit",
		"Are you sure you want to quit?",
		"",
		"Quit",
		function () {
			QuitGame("Option1");
		},
		"Return",
		function () {},
		"dim"
	);
}

function OnHomeButtonPressed() {
	$.DispatchEvent("HideContentPanel");

	// Closes the popup
	$.DispatchEvent("UIPopupButtonClicked", "");
}

function OnSettingsButtonPressed() {
	UiToolkitAPI.ShowCustomLayoutPopup("", "file://{resources}/layout/modals/popups/settings.xml");

	// Closes the popup
	$.DispatchEvent("UIPopupButtonClicked", "");
}

function QuitGame(msg) {
	// $.Msg( 'QuitGame: You pressed ' + msg + '\n' );
	GameInterfaceAPI.ConsoleCommand("quit");
}
