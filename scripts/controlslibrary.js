/* eslint-disable no-unused-vars */

"use strict";

// --------------------------------------------------------------------------------------------------
// Nav bar
// --------------------------------------------------------------------------------------------------

let activeTab;

function NavigateToTab(tab, btnPressed) {
	$.Msg(tab);
	$.Msg(btnPressed);
	if (activeTab) activeTab.RemoveClass("Active");

	activeTab = $("#" + tab);

	if (activeTab) activeTab.AddClass("Active");
}

function CloseControlsLib() {
	// Deletes the panel after a small delay to insure the animation for the panel hiding has finished.
	$.GetContextPanel().DeleteAsync(0.3);
	$.GetContextPanel().RemoveClass("Active");
}

function OpenControlsLib() {
	$.GetContextPanel().AddClass("Active");
}

// --------------------------------------------------------------------------------------------------
// Popups
// --------------------------------------------------------------------------------------------------
let jsPopupCallbackHandle;
let jsPopupLoadingBarCallbackHandle;
let popupLoadingBarLevel = 0;

function ClearPopupsText() {
	$("#ControlsLibPopupsText").text = "--";
}

function OnControlsLibPopupEvent(msg) {
	$.Msg("OnControlsLibPopupEvent: You pressed " + msg + "\n");
	$("#ControlsLibPopupsText").text = msg;
}

function OnPopupCustomLayoutParamsPressed() {
	ClearPopupsText();
	UiToolkitAPI.ShowCustomLayoutPopupParameters(
		"",
		"file://{resources}/layout/modals/popups/layout-test.xml",
		"popupvalue=123456&callback=" + jsPopupCallbackHandle
	);
}

function OnPopupCustomLayoutImagePressed() {
	ClearPopupsText();
	UiToolkitAPI.ShowCustomLayoutPopupParameters(
		"",
		"file://{resources}/layout/modals/popups/custom-layout-test-image.xml",
		"message=Example of popup with an image&image=file://{images}/control_icons/home_icon.vtf&callback=" +
			jsPopupCallbackHandle
	);
}

function OnPopupCustomLayoutImageSpinnerPressed() {
	ClearPopupsText();
	UiToolkitAPI.ShowCustomLayoutPopupParameters(
		"",
		"file://{resources}/layout/modals/popups/custom-layout-test-image.xml",
		"message=Example of popup with an image and a spinner&image=file://{images}/control_icons/home_icon.vtf&spinner=1&callback=" +
			jsPopupCallbackHandle
	);
}

function OnPopupCustomLayoutImageLoadingPressed() {
	ClearPopupsText();
	popupLoadingBarLevel = 0;
	UiToolkitAPI.ShowCustomLayoutPopupParameters(
		"",
		"file://{resources}/layout/modals/popups/custom-layout-test-image.xml",
		"message=Example of popup with an image and a loading bar&image=file://{images}/control_icons/home_icon.vtf&callback=" +
			jsPopupCallbackHandle +
			"&loadingBarCallback=" +
			jsPopupLoadingBarCallbackHandle
	);
}

function OnPopupCustomLayoutMatchAccept() {
	ClearPopupsText();
	popupLoadingBarLevel = 0;
	const popup = UiToolkitAPI.ShowCustomLayoutPopupParameters(
		"",
		"file://{resources}/layout/modals/popups/accept-match.xml",
		"map_and_isreconnect=de_dust2,false"
	);
	$.DispatchEvent("ShowAcceptPopup", popup);
}

function OnPopupCustomLayoutWeaponUpdate() {
	ClearPopupsText();

	const defIndex = 23;
	UiToolkitAPI.ShowCustomLayoutPopupParameters(
		"",
		"file://{resources}/layout/modals/popups/weapon-update.xml",
		defIndex,
		"none"
	);
}

function OnPopupCustomLayoutSurvivalEndOfMatch() {
	UiToolkitAPI.ShowCustomLayoutPopupParameters(
		"",
		"file://{resources}/layout/modals/survival/survival-endofmatch.xml",
		"usefakedata=true",
		"none"
	);
}

function OnPopupCustomLayoutLoadingScreen() {
	ClearPopupsText();
	// UiToolkitAPI.ShowCustomLayoutPopup('teams', 'file://{resources}/layout/teamselectmenu.xml');
}

function OnControlsLibPopupLoadingBarEvent() {
	popupLoadingBarLevel += 0.05;

	if (popupLoadingBarLevel > 1.0) popupLoadingBarLevel = 1.0;

	return popupLoadingBarLevel;
}

// --------------------------------------------------------------------------------------------------
// Context menus
// --------------------------------------------------------------------------------------------------

let jsContextMenuCallbackHandle;

function ClearContextMenuText() {
	$("#ControlsLibContextMenuText").text = "--";
}

function OnControlsLibContextMenuEvent(msg) {
	$.Msg("OnControlsLibContextMenuEvent: You pressed " + msg + "\n");
	$("#ControlsLibContextMenuText").text = msg;
}

function OnSimpleContextMenu() {
	ClearContextMenuText();

	const items = [];
	items.push({
		label: "Item 1",
		jsCallback: function () {
			OnControlsLibContextMenuEvent("Item1");
		},
	});
	items.push({
		label: "Item 2",
		jsCallback: function () {
			OnControlsLibContextMenuEvent("Item2");
		},
	});
	items.push({
		label: "Item 3",
		jsCallback: function () {
			OnControlsLibContextMenuEvent("Item3");
		},
	});

	UiToolkitAPI.ShowSimpleContextMenu("", "ControlLibSimpleContextMenu", items);
}

function OnContextMenuCustomLayoutParamsPressed() {
	ClearContextMenuText();
	UiToolkitAPI.ShowCustomLayoutContextMenuParameters(
		"",
		"",
		"file://{resources}/layout/modals/context-menus/custom-layout-test.xml",
		"test=123456&callback=" + jsContextMenuCallbackHandle
	);
}

// --------------------------------------------------------------------------------------------------
// Videos
// --------------------------------------------------------------------------------------------------

const videoNumTrailers = 2;
let videoCurrentTrailer = 0;

function VideoPlayNextTrailer() {
	videoCurrentTrailer = (videoCurrentTrailer + 1) % videoNumTrailers;
	const videoPlayer = $("#VideoTrailerPlayer");
	videoPlayer.SetMovie("file://{resources}/videos/trailer_" + videoCurrentTrailer + ".webm");
	videoPlayer.SetTitle("Trailer " + videoCurrentTrailer);
	videoPlayer.Play();
}

// --------------------------------------------------------------------------------------------------
// Canvas
// --------------------------------------------------------------------------------------------------

function SetCanvasDrawColor() {
	$("#Canvas1").SetDrawColorJS("#2a6b8f");
}

function ClearCanvas() {
	$("#Canvas1").ClearJS("#00000000");

	// draw test stuff
	//	var points = [ 10,15, 60,135, 110,50, 160,285, 210,325, 260,300, 310,335, 360,350, 410,375, 460,400 ];
	//	var colors = [ 'blue', 'red', 'white', 'black', 'purple', 'cyan', 'pink', 'yellow', 'green', 'orange' ];
	//	canvas.DrawThickLinePolyJS(10, points, 5.0, 'pink');

	const points = [10, 15, 300, 35, 400, 500, 5, 340];
	const colors = ["blue", "red", "white", "black"];

	canvas.DrawShadedPolyJS(4, points, colors);

	canvas.DrawLineCircleJS(720, 130, 187, "orange");
	canvas.DrawFilledCircleJS(610, 330, 127, "pink");
	canvas.DrawFilledWedgeJS(480, 430, 140, 1.3, 2.7, "red");
}

// --------------------------------------------------------------------------------------------------
// Dialog Variables
// --------------------------------------------------------------------------------------------------

let dialogVarCount = 0;

function UpdateParentDialogVariablesFromTextEntry(panelName) {
	const varStr = $("#ParentDialogVarTextEntry").text;
	$("#DialogVarParentPanel").SetDialogVariable("testvar", varStr);
}

function UpdateChildDialogVariablesFromTextEntry(panelName) {
	const varStr = $("#ChildDialogVarTextEntry").text;
	$("#DialogVarChildPanel").SetDialogVariable("testvar", varStr);
}

function InitDialogVariables() {
	$("#ControlsLibDiagVars").SetDialogVariableInt("count", dialogVarCount);
	$("#ControlsLibDiagVars").SetDialogVariable("s1", "Test1");
	$("#ControlsLibDiagVars").SetDialogVariable("s2", "Test2");
	$("#ControlsLibDiagVars").SetDialogVariable("cam_key", "%jump%");
	$("#ControlsLibDiagVars").SetDialogVariable("np_key", "%attack%");
	$("#ControlsLibDiagVars").SetDialogVariable("sp_key", "%radio%");

	// dynamically setting the text of the label
	$("#DiagVarLabel").text = $.Localize("\tDynamic Label Count: {d:r:count}", $("#ControlsLibDiagVars"));

	// Increment "count" every second
	$.Schedule(1.0, UpdateDialogVariables);

	$("#ParentDialogVarTextEntry").RaiseChangeEvents(true);
	$("#ChildDialogVarTextEntry").RaiseChangeEvents(true);
	$.RegisterEventHandler(
		"TextEntryChanged",
		$("#ParentDialogVarTextEntry"),
		UpdateParentDialogVariablesFromTextEntry
	);
	$.RegisterEventHandler("TextEntryChanged", $("#ChildDialogVarTextEntry"), UpdateChildDialogVariablesFromTextEntry);
}

function UpdateDialogVariables() {
	dialogVarCount++;
	$("#ControlsLibDiagVars").SetDialogVariableInt("count", dialogVarCount);
	// $.GetContextPanel().SetDialogVariableInt("count", dialogVarCount);

	$.Schedule(1.0, UpdateDialogVariables);
}

// --------------------------------------------------------------------------------------------------
// Panels tab
// --------------------------------------------------------------------------------------------------

function OnImageFailLoad(panelName, image) {
	const varStr = $("#ChildDialogVarTextEntry").text;

	$.Msg("ControlsLib javascript - Unable to load image, falling back to file://{images}/icons/knife.vtf.");
	$("#ControlsLibPanelImageFallback").SetImage("file://{images}/icons/knife.vtf");
}

function InitPanels() {
	const parent = $.FindChildInContext("#ControlsLibPanelsDynParent");

	$.CreatePanel("Label", parent, "", { text: "Label, with text property, created dynamically from js." });
	$.CreatePanel("Label", parent, "", {
		class: "fontSize-l fontWeight-Bold",
		style: "color:#558927;",
		text: "Label, with text and class properties, created dynamically from js.",
	});
	$.CreatePanel("TextButton", parent, "", {
		class: "PopupButton",
		text: "Output to console",
		onactivate: "$.Msg('Panel tab - Button pressed !!!')",
	});

	$.CreatePanel("ControlLibTestPanel", $.FindChildInContext("#ControlsLibPanelsJS"), "", {
		MyCustomProp: "Created dynamically from javascript",
		CreatedFromJS: 1,
	});

	// image fallback
	$.RegisterEventHandler("ImageFailedLoad", $("#ControlsLibPanelImageFallback"), OnImageFailLoad);
	$("#ControlsLibPanelImageFallback").SetImage("file://{images}/unknown2.vtf");
}

// --------------------------------------------------------------------------------------------------
// BlendBlur tab
// --------------------------------------------------------------------------------------------------

function TransitionBlurPanel() {
	$("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimOut");
	$("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimIn");
	$("#MyBlendBlurFitParent").AddClass("TheBlurAnimIn");
}

function TransitionBlurPanel2() {
	$("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimIn");
	$("#MyBlendBlurFitParent").RemoveClass("TheBlurAnimOut");
	$("#MyBlendBlurFitParent").AddClass("TheBlurAnimOut");
}

function CreateSvgFromJs() {
	$.CreatePanel("Image", $("#svgButton"), "", {
		src: "file://{images}/icons/ui/smile.svg",
		texturewidth: 100,
		textureheight: 100,
	});
}

function GetRssFeed() {
	BlogAPI.RequestRSSFeed();
}

function OnRssFeedReceived(feed) {
	const RSSFeedPanel = $("#RSSFeed");
	if (RSSFeedPanel === undefined || RSSFeedPanel === null) return;

	RSSFeedPanel.RemoveAndDeleteChildren();

	// Assume success for now
	feed.items.forEach(function (item) {
		const itemPanel = $.CreatePanel("Panel", RSSFeedPanel, "", {
			acceptsinput: true,
			onactivate: 'SteamOverlayAPI.OpenURL("' + item.link + '");',
		});
		itemPanel.AddClass("RSSFeed__Item");

		$.CreatePanel("Label", itemPanel, "", { text: item.title, html: true, class: "RSSFeed__ItemTitle" });
		if (item.imageUrl.length !== 0)
			$.CreatePanel("Image", itemPanel, "", {
				src: item.imageUrl,
				class: "RSSFeed__ItemImage",
				scaling: "stretch-to-fit-preserve-aspect",
			});

		$.CreatePanel("Label", itemPanel, "", { text: item.description, html: true, class: "RSSFeed__ItemDesc" });
		$.CreatePanel("Label", itemPanel, "", { text: item.date, html: true, class: "RSSFeed__ItemDate" });
	});
}

// Entry point called on create
(function () {
	OpenControlsLib();
	NavigateToTab("ControlLibStyleGuide");

	jsPopupCallbackHandle = UiToolkitAPI.RegisterJSCallback(OnControlsLibPopupEvent);
	jsContextMenuCallbackHandle = UiToolkitAPI.RegisterJSCallback(OnControlsLibContextMenuEvent);
	jsPopupLoadingBarCallbackHandle = UiToolkitAPI.RegisterJSCallback(OnControlsLibPopupLoadingBarEvent);

	$.RegisterForUnhandledEvent("PanoramaComponent_Blog_RSSFeedReceived", OnRssFeedReceived);
})();
