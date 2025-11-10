'use strict';

// TODO: actual CampaignAPI
class FakeCampaign {
	title: string;
	author: string;
	desc: string;
	cover: string;
	background: string;
	btnBg: string;
	ico: string;
	logo: string;
	boxart: string;

	constructor(
		title: string,
		author: string,
		desc: string,
		cover: string,
		background: string,
		btnBg: string,
		ico: string,
		logo: string,
		boxart: string
	) {
		this.title = title;
		this.author = author;
		this.desc = desc;
		this.cover = cover;
		this.background = background;
		this.btnBg = btnBg;
		this.ico = ico;
		this.logo = logo;
		this.boxart = boxart;
	}
}

class CampaignEntry {
	index: number;
	panel: Button;
	// TODO: CampaignInfo from CampaignAPI
	info: FakeCampaign;

	constructor(index: number, panel: Button, info: FakeCampaign) {
		this.index = index;
		this.panel = panel;
		this.info = info;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('CampaignTitle');
		const author = this.panel.FindChildTraverse<Label>('CampaignAuthor');
		const desc = this.panel.FindChildTraverse<Label>('CampaignDesc');
		const cover = this.panel.FindChildTraverse<Image>('CampaignCover');
		const ico = this.panel.FindChildTraverse<Image>('CampaignLogo');
		const btnBg = this.panel.FindChildTraverse<Image>('CampaignBtnBg');

		if (title) {
			title.text = this.info.title;
		}
		if (author) {
			author.text = this.info.author;
		}
		if (desc) {
			desc.text = this.info.desc;
		}
		if (cover) {
			cover.SetImage(this.info.cover);
		}
		if (ico) {
			ico.SetImage(this.info.ico);
		}
		if (btnBg) {
			btnBg.SetImage(this.info.btnBg);
		}

		this.panel.SetPanelEvent('onactivate', () => {
			CampaignMgr.campaignSelected(this.info);
		});
	}
}

// TODO: actual CampaignAPI
class FakeChapter {
	title: string;
	map: string;

	constructor(title: string, map: string) {
		this.title = title;
		this.map = map;
	}
}

class ChapterEntry {
	index: number;
	panel: Button;
	chapter: FakeChapter;
	locked: boolean;

	constructor(index: number, panel: Button, chapter: FakeChapter, locked: boolean) {
		this.index = index;
		this.panel = panel;
		this.chapter = chapter;
		this.locked = locked;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('ChapterTitle');
		const desc = this.panel.FindChildTraverse<Label>('ChapterDesc');
		const cover = this.panel.FindChildTraverse<Image>('ChapterCover');

		if (title) {
			title.text = tagDevString(`Chapter ${this.index + 1}`);
		}
		if (desc) {
			desc.text = tagDevString(this.chapter.title);
		}
		if (cover) {
			cover.SetImage(`file://{materials}/vgui/chapters/chapter${this.index + 1}.vtf`);
		}

		this.panel.SetPanelEvent('onactivate', () => {
			if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU)
				GameInterfaceAPI.ConsoleCommand(`map ${this.chapter.map}`);
			else {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					tagDevString('Confirm New Game'),
					tagDevString('Are you sure you want to start a new game? Progress will be lost!'),
					'warning-popup',
					$.Localize('#UI_Yes'),
					() => {
						GameInterfaceAPI.ConsoleCommand(`map ${this.chapter.map}`);
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			}
		});
	}
}

class SaveEntry {
	index: number;
	panel: Button;
	save: Save;

	constructor(index: number, panel: Button, save: Save) {
		this.index = index;
		this.panel = panel;
		this.save = save;
	}

	update() {
		const title = this.panel.FindChildTraverse<Label>('SaveTitle');
		const desc = this.panel.FindChildTraverse<Label>('SaveDesc');
		const cover = this.panel.FindChildTraverse<Image>('SaveCover');

		if (title) {
			title.text = this.save.name;
		}
		if (desc) {
			const date = new Date(this.save.time * 1000);
			desc.text = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		}
		if (cover) {
			cover.SetImage(`file://${this.save.thumb}`);
		}

		this.panel.SetPanelEvent('onactivate', () => {
			if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) SaveRestoreAPI.LoadSave(this.save.name);
			else {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					tagDevString('Confirm Load Game'),
					tagDevString('Are you sure you want to load this save file? Progress will be lost!'),
					'warning-popup',
					$.Localize('#UI_Yes'),
					() => {
						SaveRestoreAPI.LoadSave(this.save.name);
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			}
		});
	}
}

class CampaignNewGameTab {
	static campaignLister = $<Panel>('#CampaignLister');
	static tabLabel = $<Label>('#CampaignListerModeLabel');
	static chapterEntries: ChapterEntry[] = [];

	static setActive() {
		CampaignLoadGameTab.close();
		this.purgeChapterList();
		this.populateChapters();
		this.show();
	}

	static close() {
		this.purgeChapterList();
	}

	static show() {
		const campaignListerContainer = $<Panel>('#CampaignListerContainer');
		if (campaignListerContainer) campaignListerContainer.visible = true;
		if (this.tabLabel) this.tabLabel.text = tagDevString('New Game');
	}

	static purgeChapterList() {
		while (this.chapterEntries.length > 0) this.chapterEntries.pop()?.panel.DeleteAsync(0);
	}

	static populateChapters() {
		// TODO: Actual chapters from CampaignAPI
		if (!this.campaignLister) return;

		const chapters: FakeChapter[] = [
			{ title: 'The Courtesy Call', map: 'sp_a1_intro1' },
			{ title: 'The Cold Boot', map: 'sp_a2_laser_intro' },
			{ title: 'The Return', map: 'sp_a2_sphere_peek' },
			{ title: 'The Surprise', map: 'sp_a2_column_blocker' },
			{ title: 'The Escape', map: 'sp_a2_bts3' },
			{ title: 'The Fall', map: 'sp_a3_00' },
			{ title: 'The Reunion', map: 'sp_a3_speed_ramp' },
			{ title: 'The Itch', map: 'sp_a4_intro' },
			{ title: 'The Part Where...', map: 'sp_a4_finale1' },
			{ title: 'The Credits', map: 'sp_a5_credits' }
		];

		for (let i = 0; i < chapters.length; ++i) {
			const p = $.CreatePanel('Button', this.campaignLister, 'chapter' + i, {
				class: i !== chapters.length - 1 ? 'chapters__entry__lined' : ''
			});
			p.LoadLayoutSnippet('ChapterEntrySnippet');

			this.chapterEntries.push(new ChapterEntry(i, p, chapters[i], false));
			this.chapterEntries[i].update();
		}
	}
}

class CampaignLoadGameTab {
	static campaignLister = $<Panel>('#CampaignLister');
	static tabLabel = $<Label>('#CampaignListerModeLabel');
	static saveEntries: SaveEntry[] = [];

	static setActive() {
		CampaignNewGameTab.close();
		this.purgeSaveList();
		this.populateSaves();
		this.show();
	}

	static close() {
		this.purgeSaveList();
	}

	static show() {
		const campaignListerContainer = $<Panel>('#CampaignListerContainer');
		if (campaignListerContainer) campaignListerContainer.visible = true;
		if (this.tabLabel) this.tabLabel.text = tagDevString('Load Game');
	}

	static purgeSaveList() {
		while (this.saveEntries.length > 0) this.saveEntries.pop()?.panel.DeleteAsync(0);
	}

	static populateSaves() {
		// TODO: Saves from campaigns
		// for now this will just list all saves

		if (!this.campaignLister) return;

		const saves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time);
		for (let i = 0; i < saves.length; ++i) {
			const p = $.CreatePanel('Button', this.campaignLister, 'save' + i, {
				class: i !== saves.length - 1 ? 'saves__entry__lined' : ''
			});
			p.LoadLayoutSnippet('SaveEntrySnippet');

			this.saveEntries.push(new SaveEntry(i, p, saves[i]));
			this.saveEntries[i].update();
		}
	}

	static loadLatest() {
		const saves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time);
		if (saves.length === 0) return;

		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				tagDevString('Confirm Load'),
				tagDevString('Are you sure you want to load the latest save? Progress will be lost!'),
				'warning-popup',
				$.Localize('#UI_Yes'),
				() => {
					SaveRestoreAPI.LoadSave(saves[0].name);
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		} else {
			SaveRestoreAPI.LoadSave(saves[0].name);
		}
	}
}

class CampaignStartPage {
	static campaignListerContainer = $<Panel>('#CampaignListerContainer');
	static campaignLister = $<Panel>('#CampaignLister');
	static campaignStartPage = $<Panel>('#CampaignStartPage')!;
	static campaignLogo = $<Image>('#CampaignLogo');
	static campaignLoadLatestBtn = $<Button>('#CampaignLoadLatestBtn');
	static campaignAllSavesBtn = $<Button>('#CampaignAllSavesBtn');
	static campaignBg = $<Image>('#CampaignBackground');
	static campaignControls = $<Panel>('#CampaignControls')!;

	static {
		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onCampaignScreenShown.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', this.onLayoutReloaded.bind(this));
	}

	static onLayoutReloaded() {}

	static init() {
		this.campaignStartPage.visible = false;

		$.RegisterEventHandler('PropertyTransitionEnd', this.campaignStartPage, (panelName, propertyName) => {
			if (propertyName === 'opacity') {
				if (this.campaignStartPage.IsTransparent()) {
					this.campaignStartPage.visible = false;
				}
			}
		});
	}

	static show() {
		if (this.campaignBg && CampaignMgr.currentCampaign) {
			this.campaignBg.SetImage(CampaignMgr.currentCampaign.background);
		}
		this.campaignStartPage.visible = true;
		this.campaignStartPage.AddClass('selected-campaign__anim');
		this.campaignStartPage.AddClass('selected-campaign__show');
	}

	static hide() {
		if (this.campaignListerContainer) this.campaignListerContainer.visible = false;
		this.campaignStartPage.RemoveClass('selected-campaign__show');
		CampaignSelector.playReturnAnim();
	}

	static setActive() {
		if (!this.campaignLogo) return;

		if (CampaignMgr.currentCampaign && this.campaignLogo) {
			this.campaignLogo.SetImage(CampaignMgr.currentCampaign.logo);
		}

		this.show();
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns') return;

		if (this.campaignListerContainer) this.campaignListerContainer.visible = false;

		const hasSaves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time).length > 0;

		if (this.campaignAllSavesBtn) this.campaignAllSavesBtn.enabled = hasSaves;

		if (this.campaignLoadLatestBtn) this.campaignLoadLatestBtn.enabled = hasSaves;

		// only change campaigns when not in game
		const returnBtn = $('#CampaignStartReturn');
		if (returnBtn) returnBtn.visible = GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU;
	}

	static closeLister() {
		if (this.campaignListerContainer && this.campaignLister) {
			this.campaignLister.ScrollToTop();
			this.campaignListerContainer.visible = false;
		}
	}
}

class CampaignSelector {
	static fakeCampaigns: FakeCampaign[] = [
		{
			title: '[HC] Portal 2: Community Edition',
			author: '[HC] P2:CE Team',
			desc: '[HC] P2:CE Campaign Description',
			cover: 'file://{images}/menu/p2ce/random5.png',
			background: 'file://{images}/menu/p2ce/news-splash.png',
			btnBg: 'file://{images}/menu/p2ce/random1.png',
			ico: 'file://{images}/menu/p2ce/logo.png',
			logo: 'file://{images}/logo.svg',
			boxart: 'file://{images}/menu/p2ce/boxart.png'
		},
		{
			title: '[HC] Portal 2',
			author: '[HC] Valve',
			desc:
				'[HC] Portal 2 features a cast of dynamic new characters, a host of fresh puzzle elements, and a much ' +
				'larger set of devious test chambers. Players will explore never-before-seen areas of the Aperture Science ' +
				'Labs and be reunited with GLaDOS.',
			cover: 'file://{images}/menu/portal2/campaign_cover.png',
			background: 'file://{images}/menu/portal2/campaign_bg.png',
			btnBg: 'file://{images}/menu/portal2/campaign_btn_bg.jpg',
			ico: 'file://{images}/menu/portal2/logo.png',
			logo: 'file://{images}/menu/portal2/full_logo.png',
			boxart: 'file://{images}/menu/portal2/sp_boxart.png'
		},
		{
			title: '[HC] Portal 2 (Co-Op)',
			author: '[HC] Valve',
			desc: '[HC] Portal 2 Multiplayer Campaign Description',
			cover: 'file://{images}/menu/portal2/mp_campaign_bg.png',
			background: 'file://{images}/menu/portal2/mp_campaign_bg.png',
			btnBg: 'file://{images}/menu/portal2/mp_campaign_btn_bg.jpg',
			ico: 'file://{images}/menu/portal2/logo.png',
			logo: 'file://{images}/menu/portal2/full_logo.png',
			boxart: 'file://{images}/menu/portal2/mp_boxart.png'
		},
		{
			title: '[HC] Portal',
			author: '[HC] Valve',
			desc:
				'[HC] Set in the mysterious Aperture Science Laboratories, players must solve physical puzzles and ' +
				'challenges by opening portals to maneuver objects, and themselves, through space.',
			cover: 'file://{images}/menu/portal/campaign_bg.png',
			background: 'file://{images}/menu/portal/campaign_bg.png',
			btnBg: 'file://{images}/menu/portal/campaign_btn_bg.jpg',
			ico: 'file://{images}/menu/portal/logo.svg',
			logo: 'file://{images}/menu/portal/full_logo.svg',
			boxart: 'file://{images}/menu/portal/boxart.png'
		}
	];
	static campaignList = $<Panel>('#CampaignContainer');
	static hoverContainer = $<Panel>('#HoveredCampaignBorder')!;
	static hoverInfo = $<Panel>('#HoveredCampaignInfo')!;
	static hoverBoxart = $<Image>('#HoveredCampaignBoxart')!;
	static selectorPage = $<Panel>('#CampaignSelector')!;
	static campaignEntries: CampaignEntry[] = [];
	static hoveredCampaign: FakeCampaign | null = null;

	static {
		$.RegisterForUnhandledEvent('LayoutReloaded', this.layoutReload.bind(this));
		$.RegisterForUnhandledEvent('MainMenuTabHidden', this.onCampaignScreenHidden.bind(this));
		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onCampaignScreenShown.bind(this));
	}

	static layoutReload() {
		this.purgeCampaignList();
		this.campaignList?.RemoveAndDeleteChildren();
		this.populateCampaigns();
	}

	static onCampaignScreenHidden(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.hoverContainer.RemoveClass('campaigns__boxart__border__anim');
		this.hoverContainer.RemoveClass('campaigns__boxart__border__show');
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.hoverContainer.AddClass('campaigns__boxart__border__anim');
	}

	static init() {
		this.reloadList();
	}

	static populateCampaigns() {
		if (!this.campaignList) return;
		for (let i = 0; i < this.fakeCampaigns.length; ++i) {
			const p = $.CreatePanel('Button', this.campaignList, 'campaign' + i);
			p.LoadLayoutSnippet('CampaignEntrySnippet');

			if (i < this.fakeCampaigns.length - 1) {
				p.AddClass('campaigns__entry__spaced');
			}

			p.SetPanelEvent('onmouseover', () => { CampaignSelector.onCampaignHovered(this.fakeCampaigns[i]) });

			this.campaignEntries.push(new CampaignEntry(i, p, this.fakeCampaigns[i]));
			this.campaignEntries[i].update();
		}
		stripDevTagsFromLabels(this.campaignList);
	}

	static onCampaignHovered(info: FakeCampaign) {
		let switchDelay = 0;

		if (!this.hoverContainer.HasClass('campaigns__boxart__border__show')) {
			this.hoverContainer.AddClass('campaigns__boxart__border__show');

			if (info === this.hoveredCampaign) return;
		} else {
			if (info === this.hoveredCampaign) return;
			
			switchDelay = 0.1;

			this.hoverInfo.AddClass('campaigns__boxart__bg__switch');
			const kfs = this.hoverInfo.CreateCopyOfCSSKeyframes('BlurFadeInOut');
			this.hoverInfo.UpdateCurrentAnimationKeyframes(kfs);
		}

		this.hoveredCampaign = info;

		$.Schedule(switchDelay, () => {
			this.hoverBoxart.SetImage(info.boxart);
		});
	}

	static purgeCampaignList() {
		while (this.campaignEntries.length > 0) this.campaignEntries.pop()?.panel.DeleteAsync(0);
	}

	static reloadList() {
		this.purgeCampaignList();
		this.populateCampaigns();
	}

	static viewLooseMaps() {
		UiToolkitAPI.ShowGenericPopupOk(
			tagDevString('Feature Unavailable'),
			tagDevString('This feature is currently a work-in-progress and is not available.'),
			'blur',
			() => {}
		);
	}

	static openWorkshop() {
		SteamOverlayAPI.OpenURL('https://steamcommunity.com/app/440000/workshop/');
	}

	static hideBoxart() {
		this.hoverContainer.RemoveClass('campaigns__boxart__border__show');
	}

	static playAwayAnim() {
		this.selectorPage.AddClass('campaigns__hide');
	}

	static playReturnAnim() {
		this.selectorPage.RemoveClass('campaigns__hide');
	}
}

class CampaignMgr {
	static currentCampaign: FakeCampaign | null = null;

	static init() {
		CampaignStartPage.init();
		CampaignSelector.init();
	}

	static reload() {
		CampaignStartPage.hide();
		CampaignSelector.reloadList();
	}

	static startGame(chapter: string) {
		if (this.currentCampaign) {
			// TODO: CampaignAPI.StartCampaign(this.currentCampaign.id, chapter);
			$.Msg('Start Campaign');
		}
	}

	static campaignSelected(info: FakeCampaign) {
		this.currentCampaign = info;

		CampaignSelector.playAwayAnim();
		CampaignStartPage.setActive();
	}
}
