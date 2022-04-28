// This file contains functions that helps setting up map icon

"use strict";

// eslint-disable-next-line no-unused-vars
const IconUtil = (function () {
	// Used in the for loop below
	const _SetPNGImageFallback = function (mapIconDetails, iconImagePath) {
		if (mapIconDetails.m_type === "svg") {
			mapIconDetails.m_type = "png";
			mapIconDetails.m_icon.SetImage(iconImagePath + ".png");
		} else {
			$.UnregisterEventHandler("ImageFailedLoad", mapIconDetails.m_icon, mapIconDetails.m_handler);
			mapIconDetails.m_icon.SetImage("file://{images}/map_icons/map_icon_NONE.png"); // this should a known valid path
		}
	};

	const _SetupFallbackMapIcon = function (elIconPanel, iconImagePath) {
		const mapIconDetails = { m_icon: elIconPanel, m_type: "svg", m_handler: -1 };
		const eventHandler = $.RegisterEventHandler("ImageFailedLoad", elIconPanel, _SetPNGImageFallback.bind(undefined, mapIconDetails, icon_image_path));
		mapIconDetails.m_handler = eventHandler;
	};

	return {
		SetupFallbackMapIcon: _SetupFallbackMapIcon,
	};
})();
