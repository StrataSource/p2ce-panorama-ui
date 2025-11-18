'use strict';

class PrereleaseAck {
	static onDOSA() {
		DosaHandler.handleDosaButton($.GetContextPanel());
		UiToolkitAPI.CloseAllVisiblePopups();
	}
}
