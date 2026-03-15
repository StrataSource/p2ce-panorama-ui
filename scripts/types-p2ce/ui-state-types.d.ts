declare const enum PlayerMode {
	SINGLEPLAYER = 0,
	MULTIPLAYER = 1
}

declare const enum GameType {
	P2CE_CAMPAIGN = 0,
	P2CE_MAP = 1,
	PORTAL2_MAP = 2,
	LOOSE_MAP = 3
}

declare const enum GlobalUiObjects {
	UI_ACTIVE_CHAPTER = 'ActiveUiChapter',
	UI_ACTIVE_CAMPAIGN = 'ActiveUiCampaign',
	UI_CAMPAIGN_SETTINGS = 'UiCampaignSettings',
	UI_CAMPAIGN_SELECTOR_TYPE = 'PlayerMode'
}

declare const enum CampaignMeta {
	BOX_ART = 'box_art',
	BTN_BG = 'selector_button_background',
	COVER = 'selector_cover',
	FULL_LOGO = 'full_logo',
	LOADING_LOGO_PAD = 'loading_square_logo_padding',
	SELECTOR_LOGO_BG = 'selector_logo_background',
	SQUARE_LOGO = 'square_logo',
	DESC = 'desc',
	AUTHOR = 'author',
	TRANSITION_SCREEN = 'transition_screen',
	LOADING_SCREEN = 'loading_screen',
	CHAPTER_THUMBNAIL = 'thumbnail',
	CHAPTER_DISPLAY_MODE = 'chapter_display_mode',
	BG_MAP = 'background_map',
	BG_MUSIC = 'background_music',
	BG_MOVIE = 'background_movie',
	BG_IMG = 'background_image',
	MAP_LIST_IMG = 'img',
	MAP_LIST_TITLE = 'title',
	LOGO_HEIGHT = 'full_logo_size_preset'
}

declare const enum CampaignLogoSizePreset {
	STANDARD = 'standard',
	LARGE = 'large'
}

declare const enum ChapterDisplayMode {
	CLASSIC = 'classic',
	LIST = 'list',
	GRID = 'grid',
	SUPER = 'super',
	SQUARE_GRID = 'square_grid'
}

declare const enum SpecialString {
	P2CE_SP_WS_CAMPAIGN = 'base/p2ce_sp_ws',
	AUTO_WS = 'auto_'
}

declare const enum CampaignDataType {
	P2CE_SINGLE_WS_SPECIAL = 0
}

type MenuButton = {
	id: string;
	headline: string;
	tagline: string;
	dev?: boolean;
	oncreated?: () => void;
	activated?: () => void;
	hovered?: () => void;
	unhovered?: () => void;
	focused?: () => void;
	focusIsHover?: boolean;
	additionalClasses?: string;
};

type MenuButtonProps = {
	taglineText?: string;
	enabled?: boolean;
	visible?: boolean;
};
