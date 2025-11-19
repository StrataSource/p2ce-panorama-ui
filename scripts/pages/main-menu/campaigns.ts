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
	info: CampaignInfo;

	constructor(index: number, panel: Button, info: CampaignInfo) {
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
			title.text = $.Localize(this.info.title);
		}
		/*
		if (author) {
			author.text = $.Localize(this.info.author);
		}
		if (desc) {
			desc.text = $.Localize(this.info.desc);
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
		*/

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
	chapter: ChapterInfo;
	locked: boolean;

	constructor(index: number, panel: Button, chapter: ChapterInfo, locked: boolean) {
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
			desc.text = $.Localize(this.chapter.title);
		}
		if (cover) {
			cover.SetImage(`file://{materials}/${this.chapter.thumbnail}.vtf`);
		}

		this.panel.SetPanelEvent('onactivate', () => {
			if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
				CampaignAPI.StartCampaign(CampaignMgr.currentCampaign!.id, this.chapter.id);
			} else {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_NewGame_Title'),
					$.Localize('#Action_NewGame_Description'),
					'warning-popup',
					$.Localize('#UI_Yes'),
					() => {
						CampaignAPI.StartCampaign(CampaignMgr.currentCampaign!.id, this.chapter.id);
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
	isSaver: boolean;

	constructor(index: number, panel: Button, save: Save, isSaver: boolean) {
		this.index = index;
		this.panel = panel;
		this.save = save;
		this.isSaver = isSaver;
	}

	update() {
		const actionBtn = this.panel.FindChildTraverse('SaveAction')!;

		if (this.isSaver) {
			if (
				this.save.name.includes('quick') ||
				this.save.name.includes('autosave') ||
				this.save.name.includes('autosavedangerous')
			) {
				actionBtn.enabled = false;

				this.panel.SetPanelEvent('onmouseover', () => {
					UiToolkitAPI.ShowTextTooltip(
						this.panel.id,
						$.Localize('#MainMenu_SaveRestore_CannotOverwriteSave')
					);
				});
				this.panel.SetPanelEvent('onmouseout', () => {
					UiToolkitAPI.HideTextTooltip();
				});
			}
		}

		const title = this.panel.FindChildTraverse<Label>('SaveTitle');
		const desc = this.panel.FindChildTraverse<Label>('SaveDesc');
		const cover = this.panel.FindChildTraverse<Image>('SaveCover');
		const del = this.panel.FindChildTraverse<Button>('SaveDelete');

		if (title) {
			title.text = this.save.name;
		}
		if (desc) {
			const date = new Date(this.save.time * 1000);
			desc.text = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		}
		if (cover) {
			cover.SetImage(`file://${this.save.thumb}`);
			if (this.isSaver) cover.AddClass('saves__entry__cover__short');
		}
		if (del) {
			del.SetPanelEvent('onactivate', () => {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_DeleteGame_Confirm'),
					$.Localize('#Action_DeleteGame_Confirm_Message'),
					'warning-popup',
					$.Localize('#Action_DeleteGame'),
					() => {
						SaveRestoreAPI.DeleteSave(this.save.name);
						CampaignSavesTab.purgeSaveList();
						$.Schedule(0.001, () => {
							CampaignSavesTab.populateSaves();
							CampaignStartPage.updateLoadBtns();
						});
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			});
		}

		if (this.isSaver) {
			actionBtn.SetPanelEvent('onactivate', () => {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_OverwriteGame_Confirm'),
					$.Localize('#Action_OverwriteGame_Confirm_Message'),
					'warning-popup',
					$.Localize('#Action_OverwriteGame'),
					() => {
						SaveRestoreAPI.SaveGame(this.save.name);
						CampaignSavesTab.purgeSaveList();
						CampaignSavesTab.lockScreen();
						$.Schedule(1, () => {
							CampaignSavesTab.populateSaves();
							CampaignStartPage.updateLoadBtns();
							CampaignSavesTab.unlockScreen();
						});
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			});
		} else {
			actionBtn.SetPanelEvent('onactivate', () => {
				if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) SaveRestoreAPI.LoadSave(this.save.name);
				else {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_LoadGame_Confirm'),
						$.Localize('#Action_LoadGame_Confirm_Message'),
						'warning-popup',
						$.Localize('#Action_LoadGame'),
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
}

class CampaignNewGameTab {
	static campaignControls = $<Panel>('#CampaignControls')!;
	static campaignListerContainer = $<Panel>('#CampaignListerContainer')!;
	static campaignLister = $<Panel>('#CampaignLister')!;
	static tabLabel = $<Label>('#CampaignListerModeLabel')!;
	static chapterEntries: ChapterEntry[] = [];

	static setActive() {
		CampaignSavesTab.close();
		this.purgeChapterList();
		this.populateChapters();
		this.show();
	}

	static close() {
		this.purgeChapterList();
	}

	static show() {
		this.campaignControls.visible = false;
		this.campaignListerContainer.visible = true;
		this.tabLabel.text = $.Localize('#MainMenu_Campaigns_MM_NewGame');
	}

	static purgeChapterList() {
		while (this.chapterEntries.length > 0) this.chapterEntries.pop()?.panel.DeleteAsync(0);
	}

	static populateChapters() {
		const chapters = CampaignMgr.currentCampaign!.chapters;

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

class CampaignSavesTab {
	static campaignControls = $<Panel>('#CampaignControls')!;
	static campaignListerContainer = $<Panel>('#CampaignListerContainer')!;
	static campaignLister = $<Panel>('#CampaignLister')!;
	static tabLabel = $<Label>('#CampaignListerModeLabel')!;
	static saveEntries: SaveEntry[] = [];
	static createSaveBtn: Button | null = null;
	static isSavingGame: boolean = false;
	static backBtn = $<Button>('#CampaignBackScreen')!;

	static setSaveActive() {
		this.close();
		CampaignNewGameTab.close();
		this.purgeSaveList();
		this.addCreateSaveBtn();
		this.isSavingGame = true;
		this.populateSaves();
		this.tabLabel.text = $.Localize('#MainMenu_Campaigns_MM_SaveGame');
		this.show();
	}

	static setLoadActive() {
		this.close();
		CampaignNewGameTab.close();
		this.purgeSaveList();
		this.isSavingGame = false;
		this.populateSaves();
		this.tabLabel.text = $.Localize('#MainMenu_Campaigns_MM_LoadGame');
		this.show();
	}

	static close() {
		this.removeCreateSaveBtn();
		this.purgeSaveList();
	}

	static show() {
		this.campaignListerContainer.visible = true;
		this.campaignControls.visible = false;
	}

	static purgeSaveList() {
		while (this.saveEntries.length > 0) this.saveEntries.pop()?.panel.DeleteAsync(0);
	}

	static populateSaves() {
		// TODO: Saves from campaigns
		// for now this will just list all saves

		const saves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time);
		for (let i = 0; i < saves.length; ++i) {
			const p = $.CreatePanel('Button', this.campaignLister, 'save' + i, {
				class: i !== saves.length - 1 ? 'saves__entry__lined' : ''
			});
			p.LoadLayoutSnippet('SaveEntrySnippet');

			this.saveEntries.push(new SaveEntry(i, p, saves[i], this.isSavingGame));
			this.saveEntries[i].update();
		}
	}

	static addCreateSaveBtn() {
		this.createSaveBtn = $.CreatePanel('Button', this.campaignLister, 'CreateSave', {
			class: 'saves__entry__lined'
		});
		this.createSaveBtn.LoadLayoutSnippet('SaveEntrySnippet');

		const title = this.createSaveBtn.FindChildTraverse<Label>('SaveTitle');
		const desc = this.createSaveBtn.FindChildTraverse<Label>('SaveDesc');
		const cover = this.createSaveBtn.FindChildTraverse<Image>('SaveCover');
		const del = this.createSaveBtn.FindChildTraverse<Button>('SaveDelete');

		if (title) {
			title.text = $.Localize('#MainMenu_SaveRestore_CreateSave');
		}
		if (desc) {
			desc.visible = false;
		}
		if (cover) {
			cover.SetImage('file://{materials}/vgui/new_save_game.vtf');
			cover.AddClass('saves__entry__cover__short');
		}
		if (del) {
			del.visible = false;
		}

		this.createSaveBtn.SetPanelEvent('onactivate', () => {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				tagDevString('Save Game?'),
				tagDevString('Create new save?'),
				'generic-popup',
				$.Localize('#UI_Yes'),
				() => {
					SaveRestoreAPI.SaveGame(`${new Date().getTime()}`);
					CampaignSavesTab.purgeSaveList();
					CampaignSavesTab.lockScreen();

					if (this.createSaveBtn) this.createSaveBtn.enabled = false;

					$.Schedule(1, () => {
						CampaignSavesTab.populateSaves();
						CampaignStartPage.updateLoadBtns();
						CampaignSavesTab.unlockScreen();
						if (this.createSaveBtn?.IsValid()) this.createSaveBtn.enabled = true;
					});
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		});
	}

	static removeCreateSaveBtn() {
		if (this.createSaveBtn) this.createSaveBtn.DeleteAsync(0);
		this.createSaveBtn = null;
	}

	static loadLatest() {
		const saves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time);
		if (saves.length === 0) return;

		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_LoadGame_Confirm'),
				$.Localize('#Action_LoadGame_Auto_Message'),
				'warning-popup',
				$.Localize('#Action_LoadGame'),
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

	static lockScreen() {
		this.backBtn.enabled = false;
	}

	static unlockScreen() {
		this.backBtn.enabled = true;
	}
}

class CampaignStartPage {
	static campaignStartPage = $<Panel>('#CampaignStartPage')!;
	static campaignBg = $<Image>('#CampaignBackground')!;
	static campaignLogo = $<Image>('#CampaignLogo')!;
	static campaignListerContainer = $<Panel>('#CampaignListerContainer')!;
	static campaignLister = $<Panel>('#CampaignLister')!;
	static campaignControls = $<Panel>('#CampaignControls')!;

	static campaignLoadLatestBtn = $<Button>('#CampaignLoadLatestBtn')!;
	static campaignAllSavesBtn = $<Button>('#CampaignAllSavesBtn')!;
	static campaignSaveBtn = $<Button>('#CampaignSaveBtn')!;

	static {
		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onCampaignScreenShown.bind(this));
	}

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
		//this.campaignBg.SetImage(CampaignMgr.currentCampaign.background);
		this.campaignStartPage.visible = true;
		this.campaignStartPage.AddClass('selected-campaign__anim');
		this.campaignStartPage.AddClass('selected-campaign__show');

		const tabToOpen = $.persistentStorage.getItem('campaigns.showTab');
		if (tabToOpen) {
			const tabBtn = this.campaignControls.FindChildTraverse<Button>(tabToOpen as string);
			if (tabBtn) {
				$.DispatchEvent('Activated', tabBtn, PanelEventSource.MOUSE);
			} else {
				$.Warning('campaigns.showTab defined but invalid value');
			}
			$.persistentStorage.removeItem('campaigns.showTab');
		}
	}

	static hide() {
		this.campaignListerContainer.visible = false;
		this.campaignStartPage.RemoveClass('selected-campaign__show');
		CampaignSelector.playReturnAnim();
	}

	static setActive() {
		//if (CampaignMgr.currentCampaign) {
		//	this.campaignLogo.SetImage(CampaignMgr.currentCampaign.logo);
		//}

		this.show();
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.campaignListerContainer.visible = false;
		this.campaignControls.visible = true;

		this.updateLoadBtns();

		const isInGame = GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU;

		// only change campaigns when not in game
		const returnBtn = $('#CampaignStartReturn')!;
		returnBtn.visible = !isInGame;

		// only save game when in game
		const saveBtn = $('#CampaignSaveBtn')!;
		saveBtn.visible = isInGame;

		saveBtn.ClearPanelEvent('onmouseover');
		saveBtn.ClearPanelEvent('onmouseout');
		saveBtn.enabled = !GameInterfaceAPI.GetSettingBool('map_wants_save_disable');
		if (!saveBtn.enabled) {
			saveBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					saveBtn.id,
					$.Localize('#MainMenu_SaveRestore_SaveFailed_MapWantsSaveDisabled')
				);
			});
			saveBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		}
	}

	static updateLoadBtns() {
		const hasSaves = SaveRestoreAPI.GetSaves().sort((a, b) => b.time - a.time).length > 0;

		this.campaignAllSavesBtn.enabled = hasSaves;
		this.campaignLoadLatestBtn.enabled = hasSaves;
	}

	static closeLister() {
		this.campaignLister.ScrollToTop();
		this.campaignListerContainer.visible = false;
		this.campaignControls.visible = true;
	}
}

class CampaignSelector {
	static campaignList = $<Panel>('#CampaignContainer')!;
	static hoverContainer = $<Panel>('#HoveredCampaignContainer')!;
	static hoverInfo = $<Panel>('#HoveredCampaignInfo')!;
	static hoverBoxart = $<Image>('#HoveredCampaignBoxart')!;
	static selectorPage = $<Panel>('#CampaignSelector')!;
	static campaignEntries: CampaignEntry[] = [];
	static hoveredCampaign: CampaignInfo | null = null;
	static isHidden: boolean = false;

	static {
		$.RegisterForUnhandledEvent('LayoutReloaded', this.layoutReload.bind(this));
		$.RegisterForUnhandledEvent('MainMenuTabHidden', this.onCampaignScreenHidden.bind(this));
		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onCampaignScreenShown.bind(this));
	}

	static layoutReload() {
		this.purgeCampaignList();
		this.campaignList.RemoveAndDeleteChildren();
		this.populateCampaigns();
	}

	static onCampaignScreenHidden(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.hoverContainer.RemoveClass('campaigns__boxart__container__anim');
		this.hoverContainer.RemoveClass('campaigns__boxart__container__show');
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns') return;

		this.hoverContainer.AddClass('campaigns__boxart__container__anim');
	}

	static init() {
		this.reloadList();
	}

	static populateCampaigns() {
		const campaigns = CampaignAPI.GetAllCampaigns();
		for (let i = 0; i < campaigns.length; ++i) {
			const p = $.CreatePanel('Button', this.campaignList, 'campaign' + i);
			p.LoadLayoutSnippet('CampaignEntrySnippet');

			if (i < campaigns.length - 1) {
				p.AddClass('campaigns__entry__spaced');
			}

			p.SetPanelEvent('onmouseover', () => {
				CampaignSelector.onCampaignHovered(campaigns[i]);
			});

			this.campaignEntries.push(new CampaignEntry(i, p, campaigns[i]));
			this.campaignEntries[i].update();
		}
		stripDevTagsFromLabels(this.campaignList);
	}

	static onCampaignHovered(info: CampaignInfo) {
		let switchDelay = 0;

		if (!this.hoverContainer.HasClass('campaigns__boxart__container__show')) {
			this.hoverContainer.AddClass('campaigns__boxart__container__show');

			if (info === this.hoveredCampaign) return;
		} else {
			if (info === this.hoveredCampaign) return;

			switchDelay = 0.0;

			this.hoverInfo.AddClass('campaigns__boxart__bg__switch');
			const kfs = this.hoverInfo.CreateCopyOfCSSKeyframes('FadeIn');
			this.hoverInfo.UpdateCurrentAnimationKeyframes(kfs);
		}

		this.hoveredCampaign = info;

		$.Schedule(switchDelay, () => {
			//this.hoverBoxart.SetImage(info.boxart);
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
			$.Localize('#MainMenu_Feature_Unavailable_Title'),
			$.Localize('#MainMenu_Feature_Unavailable_Description'),
			'blur',
			() => {}
		);
	}

	static openWorkshop() {
		SteamOverlayAPI.OpenURL('https://steamcommunity.com/app/440000/workshop/');
	}

	static hideBoxart() {
		// there is a specific scenario where this can be invalid
		//
		// if boxart is shown, and then the game is closed (via OS taskbar or
		// or some other way without letting the mouse leave the campaign list),
		// then the campaign list onmouseout event fires this function, but
		// the UI stuff is being deleted at this point
		if (this.hoverContainer.IsValid()) {
			this.hoverContainer.RemoveClass('campaigns__boxart__container__show');
		}
	}

	static playAwayAnim() {
		this.selectorPage.AddClass('campaigns__hide');
		this.isHidden = true;
	}

	static playReturnAnim() {
		this.selectorPage.RemoveClass('campaigns__hide');
		this.isHidden = false;
	}
}

class CampaignMgr {
	static currentCampaign: CampaignInfo | null = null;
	static isInitialized: boolean = false;

	static {
		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onCampaignScreenShown.bind(this));
	}

	static init() {
		CampaignStartPage.init();
		CampaignSelector.init();

		this.isInitialized = true;

		this.checkOpenCampaign();
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns' || !this.isInitialized) return;

		this.checkOpenCampaign();
	}

	static checkOpenCampaign() {
		// used by main menu redirect or by loading the campaign
		// screen for the first time (but already jumped in game)
		const tryOpenCampaign = (campaignIndex: number) => {
			const campaigns = CampaignAPI.GetAllCampaigns();
			this.campaignSelected(campaigns[campaignIndex]);
		};

		const openCampaign = $.persistentStorage.getItem('campaigns.open');

		if (openCampaign) {
			tryOpenCampaign(openCampaign as number);
			$.persistentStorage.removeItem('campaigns.open');
		} else if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU && !CampaignSelector.isHidden) {
			// TODO: force show the active campaign derived from the current map
			// we don't want to switch the campaign while in-game
			// default to fake portal 2 campaign
			tryOpenCampaign(1);
		}
	}

	static startGame(chapter: string) {
		if (this.currentCampaign) {
			// TODO: CampaignAPI.StartCampaign(this.currentCampaign.id, chapter);
			$.Msg('Start Campaign');
		}
	}

	static campaignSelected(info: CampaignInfo) {
		this.currentCampaign = info;

		CampaignSelector.playAwayAnim();
		CampaignStartPage.setActive();
	}
}
