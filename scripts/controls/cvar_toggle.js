"use strict";

class CvarToggle {
	
	static toggleVar(cvarName, onValue, offValue) {
		GameInterfaceAPI.SetSettingBool(cvar, $("#ToggleButton").checked ? onValue : offValue);
	}
	
	static setup() {
		const panel = $.GetContextPanel();
		$.GetContextPanel().SetDialogVariable("cvar", panel.GetAttributeString("cvar", "invalid"));
		$.GetContextPanel().SetDialogVariable("label", panel.GetAttributeString("label", ""));
		$.GetContextPanel().SetDialogVariable("onvalue", panel.GetAttributeString("onvalue", "1"));
		$.GetContextPanel().SetDialogVariable("offvalue", panel.GetAttributeString("offvalue", "0"));
	}
}

(function () {
	CvarToggle.setup();
})();
