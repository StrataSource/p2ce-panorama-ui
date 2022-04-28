"use strict";

class Debugger {
	static setTheme() {
		$("#Debugger").SetHasClass("Debugger-Dark", $.persistentStorage.getItem("p2ce.debugger.darkmode") ?? false);
	}

	static toggleTheme() {
		const isDark = $.persistentStorage.getItem("p2ce.debugger.darkmode");
		$.persistentStorage.setItem("p2ce.debugger.darkmode", !isDark);
		Debugger.setTheme();
	}
}

(function () {
	Debugger.setTheme();
})();
