'use strict';

/**
 * @member payload Data to hold in search data for your use
 * @member text Text for this data to be tested against by the engine. Will be transformed for the engine to properly search into.
 * @member uid ID of this data, unique identification that prevents copies of a match being sent over, which should be consistent with all other data that you send with each other!
 */
class AbstractSearchData {
	payload: unknown;
	text: string;
	uid: unknown;

	constructor(payload: unknown, text: string, uid: unknown) {
		this.payload = payload;
		this.uid = uid;

		// make necessary adjustments so that the
		// search engine can properly make matches
		//
		// on big sets of data it's probably a good idea to
		// cache the search data instead of rebuilding it every query
		this.text = text.toLowerCase();
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
		const strings = search.split(/\W/).filter((s) => /^\w+$/.test(s));

		// don't show one char words
		if (!strings.some((str) => str.length > 1)) {
			insufficientFn();
			return;
		}

		// exclude copies from spaced strings
		const matches: Map<UIDType, MatchReturnType> = new Map();

		const matchAgainst = matchAgainstFn();
		// check each string part
		for (const searchPart of strings) {
			const searchPartLower = searchPart.toLowerCase();
			// match against data text
			for (const test of matchAgainst) {
				const index = test.text.indexOf(searchPartLower);

				// didn't find
				if (index === -1) {
					continue;
				}

				matches.set(test.uid as UIDType, test.payload as MatchReturnType);
			}
		}

		returnedMatchesFn(Array.from(matches.values()));
	});
}
