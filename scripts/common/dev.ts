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
	//if (GameInterfaceAPI.GetSettingBool('developer')) return;

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
	//if (GameInterfaceAPI.GetSettingBool('developer')) return str;
	return `[HC] ${str}`;
}
