'use strict';

class FeaturedMenu {
	static onLoad() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('[HC] Discover'),
			$.Localize('[HC] Curated Collections')
		);
	}

	static open(index: number) {
		UiToolkitAPI.GetGlobalObject()['featuredIndex'] = index;
		$.DispatchEvent(
			'MainMenuOpenNestedPage',
			`Featured${index}`,
			'featured/viewer',
			undefined
		);
	}
}
