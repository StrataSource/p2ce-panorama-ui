"use strict";

class Console {
	static onMoveDragStart(source, callback) {
		callback.displayPanel = $.GetContextPanel();
		callback.removePositionBeforeDrop = false;
	}

	static toggle() {
		$.DispatchEvent("ToggleConsole");
	}

	static onNewMessages() {
		$("#ConsoleMessageTarget").ScrollToBottom();
	}

	static setupFormat() {
		// todo: it only applies the change if you close and reopen
		if ($.persistentStorage.getItem("p2ce.console.quake") ?? false) {
			$("#Console").AddClass("ConsoleQuake");
			$("#ConsoleResizeDragKnob").horizontalDrag = false;
		} else {
			$.RegisterEventHandler("DragStart", $("#MoveDragArea"), Console.onMoveDragStart);
			$("#ConsoleResizeDragKnob").horizontalDrag = true;
		}
	}
}

(function () {
	Console.setupFormat();
	$.RegisterEventHandler("NewConsoleMessages", "ConsoleMessageTarget", Console.onNewMessages);
})();
