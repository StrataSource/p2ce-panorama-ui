'use strict';

class PlaytestConsent {
	static onConsent() {
		if ($.GetContextPanel().FindChildTraverse('PlayTestConsentCheckbox')?.checked) {
			GameInterfaceAPI.ConsoleCommand('cl_playtest_enabled 1');
		}
		UiToolkitAPI.CloseAllVisiblePopups();
	}

	static onDOSA() {
		DosaHandler.handleDosaButton($.GetContextPanel());
		this.onConsent();
	}
}
