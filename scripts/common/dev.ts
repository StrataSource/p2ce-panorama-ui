'use strict';

/**
 * Traverses the layout hierarchy and removes instances of
 * [PH] or [HC] in LABELS if not in developer mode.
 *
 * This assumes that
 * 1. A label contains no more than ONE tag (which it only should anyway)
 * 2. The label's tag and content are split with a space
 *
 * @param panel The panel whose layout will be traversed
 */
function stripDevTagsFromLabels(panel: GenericPanel) {
	if (GameInterfaceAPI.GetSettingBool('developer')) return;

	if (panel.paneltype === 'Label') {
		const label: Label = panel;
		if (label.text.startsWith('[HC] ') || label.text.startsWith('[PH] ')) {
			label.text = label.text.substring(5);
		}
	}

	for (const child of panel?.Children() ?? []) {
		stripDevTagsFromLabels(child);
	}
}

/**
 * Tags a string (for usage by scripts) with [HC] (hardcode)
 * if the game is running in developer mode. Otherwise, just uses
 * the string as is.
 * @param str The string
 */
function tagDevString(str: string) {
	if (GameInterfaceAPI.GetSettingBool('developer')) return `[HC] ${str}`;
	return str;
}

function getRandomFallbackImage() {
	const imagePaths = [
		'file://{images}/menu/p2ce-generic.png',
		'file://{images}/menu/fallback/dead_atlas.png',
		'file://{images}/menu/fallback/asset_missing_bright.png',
		'file://{images}/menu/fallback/programmer_art_logo.png',
		'file://{images}/menu/fallback/programmer_art_text.png',
	];
	return imagePaths[Math.floor(Math.random() * imagePaths.length)];
}

function convertTime(date: Date, split: boolean = true) {
	const currentDate = new Date();
	return `${
		date.toLocaleDateString(
			undefined,
			{
				weekday: 'long',
				month: 'long',
				day: '2-digit',
				// only display the year if we are in a different year than the save's
				year: currentDate.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
			}
		)
	}${ split ? '\n' : ' ' }${
		date.toLocaleTimeString(
			undefined,
			{
				hour: 'numeric',
				minute: 'numeric',
				second: undefined
			}
		)
	}`;
}

function convertImagePath(thumbPath: string) {
	if (
		thumbPath.endsWith('.vtf') ||
		thumbPath.endsWith('.png') ||
		thumbPath.endsWith('.jpg')
	)
		return `file://${thumbPath}`;
	else return thumbPath;
}
