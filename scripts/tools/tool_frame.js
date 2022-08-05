"use strict";

class ToolFrame {
	static onMoveDragStart(source, callback) {
		let panel = $.GetContextPanel();
		callback.displayPanel = panel;
		callback.removePositionBeforeDrop = false;
		panel.myParent = panel.GetParent();
	}
	
	static onMoveDragEnd() {
		// Hacky but works- we need to restore our parent because dragging sets it to null
		let panel = $.GetContextPanel();
		panel.SetParent(panel.myParent);
	}

	static close() {
		//$.DispatchEvent("ToggleConsole");
		$.GetContextPanel().DeleteAsync(0);
	}
	
	// Toggles visibility of the main container and switches the arrow icon
	static toggleCollapse() {
		const container = $("#CollapseContainer");
		const newVis = !container.visible;
		
		const anims = [
			"button-hide__hidden",
			"button-hide__shown"
		];
		const index = newVis  ? 1 :0;
		const anim = anims[index];
		const oldAnim = anims[(index + 1) % 2];
		
		container.visible = newVis;
		
		const buttonIcon = $("#CollapseIcon");
		buttonIcon.AddClass(anim);
		buttonIcon.RemoveClass(oldAnim);
	}

	static setup() {
		const panel = $.GetContextPanel();
		panel.SetDialogVariable("title", panel.GetAttributeString("title", "Untitled Tool Panel"));
		panel.SetDialogVariable("layout", panel.GetAttributeString("layout", ""));
		
		let topBar = $("#TopBar")
		$.RegisterEventHandler("DragStart", topBar, ToolFrame.onMoveDragStart);
		$.RegisterEventHandler("DragEnd", topBar, ToolFrame.onMoveDragEnd);
		$("#ToolPanelResize").horizontalDrag = true;
	}
}

(function () {
	ToolFrame.setup();
})();
