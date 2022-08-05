"use strict";

// --------------------------------------------------------------------------------------------------
// Purpose: Common place to register new panel type with panorama
// --------------------------------------------------------------------------------------------------

(function () {
	UiToolkitAPI.RegisterPanel2d("ControlLibTestPanel", "file://{resources}/layout/tests/controllibtestpanel.xml");
	
	UiToolkitAPI.RegisterPanel2d("CvarToggle", "file://{resources}/layout/controls/cvar_toggle.xml");
	//UiToolkitAPI.RegisterPanel2d("CvarSlider", "file://{resources}/layout/controls/cvar_slider.xml");
	
	UiToolkitAPI.RegisterPanel2d("ChaosToolPanel", "file://{resources}/layout/tools/tool_frame.xml");
})();
