// This file contains functions that pertain to string formating

"use strict";

// A CFormattedText object looks like this:
//
//  var formattedText = {
//      tag: '#Panorama_Whatever',
//      vars: {
//          somevar: 'somevalue',
//          ...
//      }
//  };
//
// Note: currently we only support string values for dialog variables, this could be changed.  Please
//       do not put non-strings into vars{} because the behavior for non-strings might change in the
//       future -- always explicitly convert to string.
//

// eslint-disable-next-line no-unused-vars
class CFormattedText {
	constructor(strLocTag, mapDialogVars) {
		this.tag = strLocTag;

		// clone vars to avoid reference mutation behind our back
		this.vars = Object.assign({}, mapDialogVars);
	}

	SetOnLabel(elLabel) {
		FormatText.SetFormattedTextOnLabel(elLabel, this);
	}
}

const FormatText = (function () {
	const _SetFormattedTextOnLabel = function (elLabel, fmtText) {
		_ClearFormattedTextFromLabel(elLabel);

		elLabel.text = fmtText.tag;
		elLabel.fmtTextVars = {};
		for (const varName in fmtText.vars) {
			elLabel.SetDialogVariable(varName, fmtText.vars[varName]);
			elLabel.fmtTextVars[varName] = true;
		}
	};

	const _ClearFormattedTextFromLabel = function (elLabel) {
		elLabel.text = "";

		if (!elLabel.fmtTextVars) return;

		for (const varName in elLabel.fmtTextVars) {
			// TODO: Add 'ClearDialogVariable' to remove a dvar from a panel
			elLabel.SetDialogVariable(varName, "");
		}

		// remove key
		delete elLabel.fmtTextVars;
	};

	/// //// time convertions ///////

	const _SecondsToDDHHMMSSWithSymbolSeperator = function (rawSeconds) {
		const time = _ConvertSecondsToDaysHoursMinSec(rawSeconds);
		const timeText = [];

		let returnRemaining = false;
		for (const key in time) {
			// Always return minutes and seconds.
			// Don't return empty days hours.
			if ((time[key] > 0 && !returnRemaining) || key === "minutes") returnRemaining = true;

			if (returnRemaining) {
				const valueToShow = time[key] < 10 ? "0" + time[key].toString() : time[key].toString();
				timeText.push(valueToShow);
			}
		}

		return timeText.join(":");
	};

	const _SecondsToSignificantTimeString = function (rawSeconds) {
		if (rawSeconds < 60) return "1 " + $.Localize("#SFUI_Store_Timer_Min");

		const time = _ConvertSecondsToDaysHoursMinSec(rawSeconds);
		let numComponentsReturned = 0;
		let strResult = "";
		for (const key in time) {
			if (key === "seconds") break;

			let bAppendThisComponent = false;
			const bFinishedAfterThisComponent = numComponentsReturned > 0;
			if (time[key] > 0) {
				bAppendThisComponent = true;
			}
			if (bAppendThisComponent) {
				if (bFinishedAfterThisComponent) strResult += " ";

				// eslint-disable-next-line no-var
				var lockey;
				if (key === "minutes") lockey = "#SFUI_Store_Timer_Min";
				else if (key === "hours") lockey = "#SFUI_Store_Timer_Hour";
				else lockey = "#SFUI_Store_Timer_Day";

				strResult += time[key].toString();
				strResult += " ";

				strResult += $.Localize(lockey + (time[key] > 1 ? "s" : ""));

				++numComponentsReturned;
			}
			if (bFinishedAfterThisComponent) break;
		}
		return strResult;
	};

	// eslint-disable-next-line no-var
	var _ConvertSecondsToDaysHoursMinSec = function (rawSeconds) {
		rawSeconds = Number(rawSeconds);

		const time = {
			days: Math.floor(rawSeconds / 86400),
			hours: Math.floor((rawSeconds % 86400) / 3600),
			minutes: Math.floor(((rawSeconds % 86400) % 3600) / 60),
			seconds: ((rawSeconds % 86400) % 3600) % 60,
		};

		return time;
	};

	const _PadNumber = function (integer, digits, char = "0") {
		integer = integer.toString();

		while (integer.length < digits) integer = char + integer;

		return integer;
	};

	return {
		SetFormattedTextOnLabel:
			_SetFormattedTextOnLabel /* see documentation for FormattedText objects at top of file */,
		ClearFormattedTextFromLabel:
			_ClearFormattedTextFromLabel /* see documentation for FormattedText objects at top of file */,
		SecondsToDDHHMMSSWithSymbolSeperator: _SecondsToDDHHMMSSWithSymbolSeperator /* takes seconds */,
		SecondsToSignificantTimeString: _SecondsToSignificantTimeString /* takes seconds, returns easy human string */,
		PadNumber: _PadNumber /* takes integer and number of desired digits, optionally padding character */,
	};
})();
