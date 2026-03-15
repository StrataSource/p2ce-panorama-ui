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
		'file://{images}/menu/fallback/programmer_art_text.png'
	];
	return imagePaths[Math.floor(Math.random() * imagePaths.length)];
}

function convertTime(date: Date, split: boolean = true) {
	const currentDate = new Date();
	return `${date.toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'long',
		day: '2-digit',
		// only display the year if we are in a different year than the save's
		year: currentDate.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
	})}${split ? '\n' : ' '}${date.toLocaleTimeString(undefined, {
		hour: 'numeric',
		minute: 'numeric',
		second: undefined
	})}`;
}

function constructMenuButton(btn: MenuButton) {
	// constructed manually because LoadLayoutString HATES ME!!!

	// create the button
	const b = $.CreatePanel('Button', $.GetContextPanel(), btn.id, {
		class: `mainmenu__nav__btn${btn.additionalClasses ? ` ${btn.additionalClasses}` : ''}`,
		tabindex: 'auto',
		selectionpos: 'auto'
	});

	b.SetReadyForDisplay(false);

	// create the panel for texts
	const bp = $.CreatePanel('Panel', b, `${btn.id}_Panel`, {
		class: 'vertical-align-center flow-down'
	});

	// create the texts
	$.CreatePanel('Label', bp, `${btn.id}_Headline`, {
		class: 'mainmenu__nav__btn__text',
		text: $.Localize(btn.headline)
	});

	$.CreatePanel('Label', bp, `${btn.id}_Tagline`, {
		class: 'mainmenu__nav__btn__small-text',
		text: $.Localize(btn.tagline)
	});

	// set up events
	if (btn.activated) b.SetPanelEvent('onactivate', btn.activated);

	if (btn.hovered) b.SetPanelEvent('onmouseover', btn.hovered);

	if (btn.unhovered) b.SetPanelEvent('onmouseout', btn.unhovered);

	if (btn.focusIsHover && btn.hovered) b.SetPanelEvent('onfocus', btn.hovered);
	else if (btn.focused) b.SetPanelEvent('onfocus', btn.focused);

	// add Steam Input glyph
	// FIXME: add Steam Input elements to types
	$.CreatePanel('SteamInputAction', b, `${btn.id}_Action`, {
		actionset: 'MenuControls',
		action: 'menu_select',
		separatortext: '/',
		controllernumber: '1',
		glyphsize: 'large'
	});

	return b;
}

function getCampaignAssetPath(pair: CampaignPair) {
	const path = WorkshopAPI.GetAddonNamedPath(pair.bucket.addon_id);
	if (path.length > 0) {
		return `file://${path}/.assets/`;
	} else {
		return 'file://';
	}
}

function isSpecialSingleWsCampaign(c: CampaignPair) {
	return `${c.bucket.id}/${c.campaign.id}` === SpecialString.P2CE_SP_WS_CAMPAIGN;
}

function isSingleWsCampaign(c: CampaignPair) {
	return c.bucket.id.startsWith(SpecialString.AUTO_WS);
}

function isBucketSingleWsCampaign(b: CampaignBucket) {
	return b.id.startsWith(SpecialString.AUTO_WS);
}

function getChapterThumbnail(p: CampaignPair, ch: VirtualChapter) {
	const thumb = ch.meta.get(CampaignMeta.CHAPTER_THUMBNAIL);
	if (thumb) {
		if ((thumb as string).startsWith('http') || ch.type === CampaignDataType.P2CE_SINGLE_WS_SPECIAL) {
			return thumb;
		} else {
			const basePath = getCampaignAssetPath(p);
			return `${basePath}${thumb}`;
		}
	} else {
		return getRandomFallbackImage();
	}
}

function installImageFallbackHandler(imagePanel: Image) {
	$.RegisterEventHandler('ImageFailedLoad', imagePanel, () => {
		imagePanel.SetImage(getRandomFallbackImage());
	});
}

class VirtualMap implements ChapterMap {
	name: string;
	meta: Map<string, string>;

	constructor(name: string) {
		this.name = name;
		this.meta = new Map<string, string>();
	}
}

class VirtualChapter implements ChapterInfo {
	id: string;
	title: string;
	maps: ChapterMap[];
	meta: Map<string, string>;
	type?: CampaignDataType | undefined;

	constructor(id: string, title: string, maps: ChapterMap[], thumb: string) {
		this.id = id;
		this.title = title;
		this.maps = maps;
		this.meta = new Map<string, string>();
		this.meta.set(CampaignMeta.CHAPTER_THUMBNAIL, thumb);
		this.type = CampaignDataType.P2CE_SINGLE_WS_SPECIAL;
	}
}

class VirtualCampaign implements CampaignInfo {
	id: string;
	title: string;
	chapters: ChapterInfo[];

	meta: Map<string, string>;

	constructor(id: string, title: string, chapters: ChapterInfo[]) {
		this.id = id;
		this.title = title;
		this.chapters = chapters;
		this.meta = new Map<string, string>();
	}
}
