/* eslint-disable no-unused-vars */

"use strict";

const Collapse = (function () {
	const _LogInternal = function (str) {
		$.Msg(str);
	};
	const _LogInternalEmpty = function (str) {};
	// var _Log = _LogInternal;
	const _Log = _LogInternalEmpty;

	const _RegisterTransitionEndEventHandler = function (panel) {
		if (panel.Collapse_OnTransitionEndEvent === undefined) {
			// Create handler on the panel
			panel.Collapse_OnTransitionEndEvent = function (panelName, propertyName) {
				if (panel.id === panelName && propertyName === "height" && panel.BHasClass("Collapsing")) {
					_Log("Collpase - End of transition");

					panel.RemoveClass("Collapsing");
					// TODO Restore original value in case it was set
					panel.style.height = null;

					return true;
				}
				return false;
			};

			// Register handler
			$.RegisterEventHandler("PropertyTransitionEnd", panel, panel.Collapse_OnTransitionEndEvent);
			_Log("Collpase transition end event registered");
		}
	};

	const _Show = function (panel, bIsStyleHeightFitChildren) {
		_Log("Collapse.Show " + panel.id);

		_RegisterTransitionEndEventHandler(panel);

		// Add 'Collapsing' class to panel => Add transition on height
		panel.AddClass("Collapsing");

		if (bIsStyleHeightFitChildren) {
			// We'd like to animate the height from 0px to the full height of the panel.
			// Note that if the target height is 'fit-children', the animation will snap to the target height
			// Therefore overwrite the height for the duration of the animation (cf _RegisterTransitionEndEventHandler
			// to reset height)
			panel.style.height = panel.contentheight + "px"; // TODO keep track of old height value ??? (if set)
		}

		panel.RemoveClass("Collapsed");
	};

	const _Hide = function (panel, bIsStyleHeightFitChildren) {
		_Log("Collapse.Hide " + panel.id);

		_RegisterTransitionEndEventHandler(panel);

		if (bIsStyleHeightFitChildren) {
			// We'd like to animate the height from the full height of the panel to 0px.
			// Note that if the current height is 'fit-children', the animation will snap to the target height
			// Therefore overwrite the height for the duration of the animation (cf _RegisterTransitionEndEventHandler
			// to reset height)
			panel.style.height = panel.contentheight + "px"; // TODO keep track of old height value ??? (if set)
		}

		// Add 'Collapsing' class to panel => Add transition on height
		panel.AddClass("Collapsing");
		panel.AddClass("Collapsed");

		if (bIsStyleHeightFitChildren) {
			// Start transition from height overwrite to 0px (set by 'Collapsed' class)
			panel.style.height = "0px";
		}
	};

	const _Toggle = function (panel, bIsStyleHeightFitChildren) {
		_Log("Collapse.Toggle " + panel.id);

		if (panel.BHasClass("Collapsed")) {
			_Show(panel, bIsStyleHeightFitChildren);
		} else {
			_Hide(panel, bIsStyleHeightFitChildren);
		}
	};

	/* Public interface */
	return {
		Show: _Show /* arguments ( panel, bIsStyleHeightFitChildren ) */,
		Hide: _Hide /* arguments ( panel, bIsStyleHeightFitChildren ) */,
		Toggle: _Toggle /* arguments ( panel, bIsStyleHeightFitChildren ) */,
	};
})();
