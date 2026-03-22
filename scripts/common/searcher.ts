'use strict';

/**
 * @member payload Data to hold in search data for your use
 * @member text Text for this data to be tested against by the engine
 * @member uid ID of this data, unique identification that prevents copies of a match being sent over, which should be consistent with all other datum that you send with each other!
 */
class AbstractSearchData {
	payload: unknown;
	text: string;
	uid: unknown;

	constructor(payload: unknown, text: string, uid: unknown) {
		this.payload = payload;
		this.text = text;
		this.uid = uid;
	}
}

/**
 *
 * Shared abstract textbox searching behavior
 *
 * @type `UIDType` - type of the UID is AbstractSearchData
 * @type `MatchReturnType` - type of returned match payloads
 *
 * @param textEntry panel to test text against
 * @param doNothingFn early exit -> no text in panel
 * @param insufficientFn early exit -> no combination of strings in panel is greater than 1 char
 * @param matchAgainstFn data <- search engine request for data to test text against
 * @param returnedMatchesFn success -> composed matches, do something with them!
 *
 */
function installSearchHandling<UIDType, MatchReturnType>(
	textEntry: TextEntry,
	doNothingFn: () => void,
	insufficientFn: () => void,
	matchAgainstFn: () => Array<AbstractSearchData>,
	returnedMatchesFn: (matches: Array<MatchReturnType>) => void
) {
	textEntry.RaiseChangeEvents(true);
	$.RegisterEventHandler('TextEntryChanged', textEntry, () => {
		const search = textEntry.text;
		// check empty
		if (!/.*\S.*/.test(search)) {
			doNothingFn();
			return;
		}

		// split
		const strings = search.split(/\s/).filter((s) => /^\w+$/.test(s));

		// don't show one char words
		if (!strings.some((str) => str.length > 1)) {
			insufficientFn();
			return;
		}

		const matches: Array<MatchReturnType> = [];

		const matchAgainst = matchAgainstFn();
		const matchRecords: Array<UIDType> = [];
		for (const searchPart of strings) {
			if (!searchPart) {
				break;
			}

			for (const test of matchAgainst) {
				const testLower = test.text.toLowerCase();
				const index = testLower.indexOf(searchPart.toLowerCase());

				if (index === -1) {
					continue;
				}

				// exclude copies from spaced strings
				if (!matchRecords.includes(test.uid as UIDType)) {
					matchRecords.push(test.uid as UIDType);
					matches.push(test.payload as MatchReturnType);
				}
			}
		}

		returnedMatchesFn(matches);
	});
}
