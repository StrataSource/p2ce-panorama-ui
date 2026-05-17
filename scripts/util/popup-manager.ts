'use strict';

class PopupManager {
	static onPopupBackgroundClicked() {
		const ctx = $.GetContextPanel();
		const topPop = ctx.Children()[ctx.Children().length - 1];
		// protected
		if (topPop.id !== 'DimBackground' && topPop.id !== 'BlurBackground') {
			if (topPop.GetAttributeInt('cancelAllowed', 1) === 0) {
				return;
			}
			$.DispatchEvent('Cancelled', topPop, PanelEventSource.PROGRAM);
		}
	}
}
