"use strict";

class ToolManager {

	// Add your own tool menus to this!
	static windows = {
		"csm": {
			"title": "CSM Debug Panel",
			"layout": "file://{resources}/layout/tools/tool_csm_panel.xml"
		}
	}
	
	static createWindow(name) {
		let w = ToolManager.windows[name]
		if (w === undefined) {
			$.Warning("Could not create window '{}'".format(name))
			return
		}
		
		let panel = $.CreatePanel("ChaosToolPanel", $.GetContextPanel(), undefined, w)
		panel.SetAttributeString("title", w["title"])
		panel.visible = true
	}
	
	// Remove + re-add all panels to the UI dropdown
	static addDropDownEntries() {
		let launcher = $("#LauncherDropDown")
		
		let i = 0
		for (let [name, item] of Object.entries(this.windows)) {
			// Create the button
			let button = $.CreatePanel("Button", launcher, undefined, {"onactivate": "ToolManager.launcherSelected('"+name+"')"})
			button.AddClass('launcher-item')
			
			// Create the label for the button
			let label = $.CreatePanel("Label", button, undefined)
			label.text = item["title"]
			label.AddClass('launcher-item')
		}
	}
	
	static launcherSelected(panel) {
		let dropdown = $("#LauncherDropDown")
		dropdown.visible = false
		
		ToolManager.createWindow(panel)
	}
	
	static toggleLauncher() {
		let dropdown = $("#LauncherDropDown")
		dropdown.visible = !dropdown.visible
	}
	
	static setup() {
		$.RegisterEventHandler("CreateWindow", $.GetContextPanel(), ToolManager.createWindow);
		this.addDropDownEntries()
	}
}

(function () {
	ToolManager.setup();
})();
