"use strict";

const HudEdgePositions = (function () {
	const _OnSliderValueChanged = function () {
		let width = $("#HudEdgeX").ActualValue() * 100;
		width = width.toString() + "%";

		let height = $("#HudEdgeY").ActualValue() * 100;
		height = height.toString() + "%";

		const elHudEdge = $("#HudEdge");
		elHudEdge.style.width = width;
		elHudEdge.style.height = height;
	};

	/* Public interface */
	return {
		OnSliderValueChanged: _OnSliderValueChanged,
	};
})();

(function () {
	// Call OnShow manually here on sliders, to correctly init from convars. This is required
	// because using the .ChaosSettingsSlider__hidevalue #Value style to hide the slider values results in
	// OnShow not being automatically called.
	$("#HudEdgeX").OnShow();
	$("#HudEdgeY").OnShow();

	HudEdgePositions.OnSliderValueChanged();
})();
