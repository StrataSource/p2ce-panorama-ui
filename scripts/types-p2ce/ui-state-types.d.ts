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
	UI_CAMPAIGN_SETTING_PAGE = 'UiCampaignSettingPage'
}

declare const enum CampaignMeta {
	BOX_ART = 'box_art',
	BTN_BG = 'selector_button_background',
	COVER = 'selector_cover',
	FULL_LOGO = 'full_logo',
	SQUARE_LOGO = 'square_logo',
	DESC = 'desc',
	AUTHOR = 'author'
}

type MenuButton = {
	id: string;
	headline: string;
	tagline: string;
	oncreated?: () => void;
	activated?: () => void;
	hovered?: () => void;
	unhovered?: () => void;
	focused?: () => void;
	focusIsHover?: boolean;
};
