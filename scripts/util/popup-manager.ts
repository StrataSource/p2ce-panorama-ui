'use strict';

class PopupManager {
	static onPopupBackgroundClicked() {
		const ctx = $.GetContextPanel();
		const topPop = ctx.Children()[ctx.Children().length - 1];
		// protected
		if (topPop.id !== 'DimBackground' && topPop.id !== 'BlurBackground') {
			$.DispatchEvent('Cancelled', topPop, PanelEventSource.PROGRAM);
		}
	}
}
