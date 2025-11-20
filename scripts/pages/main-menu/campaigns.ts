'use strict';

// TODO: SPLIT INTO MULTIPLE FILES, THIS IS GETTING ABSURD!!

/**
 * Find campaign by map.
 * Returns undefined if it doesn't exist.
 */
function getCampaignFromMap(mapToFind: string) {
	const campaigns = CampaignAPI.GetAllCampaigns();
	const matching = campaigns.find((campaign: CampaignInfo) => {
		return campaign.chapters.find((chapter: ChapterInfo) => {
			return chapter.maps.find((map) => {
				return map.name === mapToFind;
			}) !== undefined;
		}) !== undefined;
	});
	return matching;
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
	save: GameSave;
	isSaver: boolean;

	constructor(index: number, panel: Button, save: GameSave, isSaver: boolean) {
		this.index = index;
		this.panel = panel;
		this.save = save;
		this.isSaver = isSaver;
	}

	update() {
		const actionBtn = this.panel.FindChildTraverse('SaveAction')!;

		if (this.isSaver) {
			if (this.save.isAutoSave) {
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
			title.text = this.save.mapName;
		}
		if (desc) {
			const date = new Date(this.save.fileTime * 1000);
			desc.text = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		}
		if (cover) {
			const thumb = `file://{__saves}/${this.save.fileName.replace('.sav', '.tga')}`;
			$.Msg(`Save screenshot resource: ${thumb}`);
			cover.SetImage(thumb);
			if (this.isSaver) cover.AddClass('saves__entry__cover__short');
		}
		if (del) {
			del.enabled = false;
			
			//del.SetPanelEvent('onactivate', () => {
			//	UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			//		$.Localize('#Action_DeleteGame_Confirm'),
			//		$.Localize('#Action_DeleteGame_Confirm_Message'),
			//		'warning-popup',
			//		$.Localize('#Action_DeleteGame'),
			//		() => {
			//			SaveRestoreAPI.DeleteSave(this.save.name);
			//			CampaignSavesTab.purgeSaveList();
			//			$.Schedule(0.001, () => {
			//				CampaignSavesTab.populateSaves();
			//				CampaignStartPage.updateLoadBtns();
			//			});
			//		},
			//		$.Localize('#UI_Cancel'),
			//		() => {},
			//		'blur'
			//	);
			//});
		}

		if (this.isSaver) {
			actionBtn.SetPanelEvent('onactivate', () => {
				UiToolkitAPI.ShowGenericPopupOk(
					$.Localize('MainMenu_Feature_Unavailable_Title'),
					$.Localize('MainMenu_Feature_Unavailable_Description'),
					'warning-popup',
					() => {}
				);

				//UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				//	$.Localize('#Action_OverwriteGame_Confirm'),
				//	$.Localize('#Action_OverwriteGame_Confirm_Message'),
				//	'warning-popup',
				//	$.Localize('#Action_OverwriteGame'),
				//	() => {
				//		SaveRestoreAPI.SaveGame(this.save.name);
				//		CampaignSavesTab.purgeSaveList();
				//		CampaignSavesTab.lockScreen();
				//		$.Schedule(1, () => {
				//			CampaignSavesTab.populateSaves();
				//			CampaignStartPage.updateLoadBtns();
				//			CampaignSavesTab.unlockScreen();
				//		});
				//	},
				//	$.Localize('#UI_Cancel'),
				//	() => {},
				//	'blur'
				//);
			});
		} else {
			actionBtn.SetPanelEvent('onactivate', () => {
				if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) GameInterfaceAPI.ConsoleCommand(`load ${this.save.fileName}`);
				else {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_LoadGame_Confirm'),
						$.Localize('#Action_LoadGame_Confirm_Message'),
						'warning-popup',
						$.Localize('#Action_LoadGame'),
						() => {
							GameInterfaceAPI.ConsoleCommand(`load ${this.save.fileName}`);
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
		const saves = GameSavesAPI.GetGameSaves()
			.filter((v: Save) => { return v.mapGroup === CampaignMgr.currentCampaign!.id })
			.sort((a, b) => b.fileTime - a.fileTime);

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
					CampaignSavesTab.purgeSaveList();
					GameSavesAPI.CreateSaveGame();
					CampaignSavesTab.lockScreen();

					if (this.createSaveBtn) this.createSaveBtn.enabled = false;

					const checkSaving = () => {
						$.Schedule(0.001, () => {
							if (GameSavesAPI.IsSaveInProgress() || GameSavesAPI.IsAutosaveInProgress()) {
								$.Schedule(0.001, checkSaving);
								return;
							}

							CampaignSavesTab.populateSaves();
							CampaignStartPage.updateButtons();
							CampaignSavesTab.unlockScreen();
							if (this.createSaveBtn?.IsValid()) this.createSaveBtn.enabled = true;
						});
					}
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
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_LoadGame_Confirm'),
				$.Localize('#Action_LoadGame_Auto_Message'),
				'warning-popup',
				$.Localize('#Action_LoadGame'),
				() => {
					if (CampaignMgr.currentCampaign)
						CampaignAPI.ContinueCampaign(CampaignMgr.currentCampaign.id);
					else {
						const saves = GameSavesAPI.GetGameSaves().sort((a, b) => b.fileTime - a.fileTime);
						GameInterfaceAPI.ConsoleCommand(`load ${saves[0].fileName}`);
					}
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		} else {
			if (CampaignMgr.currentCampaign)
				CampaignAPI.ContinueCampaign(CampaignMgr.currentCampaign.id);
			else {
				const saves = GameSavesAPI.GetGameSaves().sort((a, b) => b.fileTime - a.fileTime);
				GameInterfaceAPI.ConsoleCommand(`load ${saves[0].fileName}`);
			}
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

	static init() {
		this.campaignStartPage.visible = false;

		$.RegisterEventHandler('PropertyTransitionEnd', this.campaignStartPage, (panelName, propertyName) => {
			if (propertyName === 'opacity') {
				if (this.campaignStartPage.IsTransparent()) {
					this.campaignStartPage.visible = false;
				}
			}
		});

		this.closeLister();
	}

	static show() {
		//this.campaignBg.SetImage(CampaignMgr.currentCampaign.background);
		this.campaignStartPage.visible = true;
		this.campaignStartPage.AddClass('selected-campaign__anim');
		this.campaignStartPage.AddClass('selected-campaign__show');

		$<Label>('#CampaignNamePlaceholder')!.text = `[DEV] DO NOT LOCALIZE - Campaign: ${CampaignMgr.currentCampaign!.title}`;
		this.updateButtons();
		this.checkOpenTab();
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

		this.updateButtons();
	}

	static updateButtons() {
		const hasSaves = GameSavesAPI.GetGameSaves().filter((v: Save) => {
			if (CampaignMgr.currentCampaign === undefined) return false;
			return v.mapGroup === CampaignMgr.currentCampaign!.id;
		}).length > 0;

		this.campaignAllSavesBtn.enabled = hasSaves;
		this.campaignLoadLatestBtn.enabled = hasSaves;

		const isInGame = GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU;

		// only save game when in game
		const saveBtn = $('#CampaignSaveBtn')!;
		saveBtn.visible = isInGame;
		saveBtn.ClearPanelEvent('onmouseover');
		saveBtn.ClearPanelEvent('onmouseout');
		saveBtn.enabled = !GameInterfaceAPI.GetSettingBool('map_wants_save_disable') && !CampaignMgr.isInUnspecifiedMap;
		if (GameInterfaceAPI.GetSettingBool('map_wants_save_disable')) {
			saveBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					saveBtn.id,
					$.Localize('#MainMenu_SaveRestore_SaveFailed_MapWantsSaveDisabled')
				);
			});
			saveBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		} else if (CampaignMgr.isInUnspecifiedMap) {
			saveBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					saveBtn.id,
					tagDevString('The map you are playing on does not belong to this campaign.\nYou cannot save here.')
				);
			});
			saveBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		}

		const returnBtn = $('#CampaignStartReturn')!;
		returnBtn.enabled = !isInGame || CampaignMgr.isInUnspecifiedMap;
		returnBtn.ClearPanelEvent('onmouseover');
		returnBtn.ClearPanelEvent('onmouseout');
		if (!returnBtn.enabled) {
			returnBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					returnBtn.id,
					tagDevString('Cannot switch campaigns while in game.\nReturn to the main menu first.')
				);
			});
			returnBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		}
	}

	static checkOpenTab() {
		// check if a tab is queued to be opened
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

		$.RegisterForUnhandledEvent('LayoutReloaded', this.layoutReload.bind(this));
		$.RegisterForUnhandledEvent('MainMenuTabHidden', this.onCampaignScreenHidden.bind(this));
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
	static isInUnspecifiedMap = false;

	static init() {
		CampaignSelector.init();
		CampaignStartPage.init();

		$.RegisterForUnhandledEvent('MainMenuTabShown', this.onCampaignScreenShown.bind(this));

		this.isInitialized = true;

		this.checkOpenCampaign();
	}

	static onCampaignScreenShown(tabid: string) {
		if (tabid !== 'Campaigns' || !this.isInitialized) return;

		CampaignStartPage.closeLister();
		
		this.checkOpenCampaign();

		CampaignSelector.onCampaignScreenShown(tabid);
		CampaignStartPage.onCampaignScreenShown(tabid);
	}

	static checkOpenCampaign() {
		const openCampaign = $.persistentStorage.getItem('campaigns.open');

		if (openCampaign) {
			$.Msg(`openCampaign defined, attempting to force open: ${openCampaign}`);

			const campaigns = CampaignAPI.GetAllCampaigns();
			const c = campaigns.find((campaign: CampaignInfo) => { return campaign.id === openCampaign });

			if (c) {
				this.campaignSelected(c);
				this.isInUnspecifiedMap = false;
			}
			else $.Warning(`Campaign of ID ${openCampaign} does not exist`);

			$.persistentStorage.removeItem('campaigns.open');
		} else if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			const curMap = GameInterfaceAPI.GetCurrentMap()!;
			const mapCampaign = getCampaignFromMap(curMap);

			this.isInUnspecifiedMap = mapCampaign === undefined;

			if (!CampaignSelector.isHidden) {
				$.Msg('Game in progress and selector open, attempting to force open a campaign...');

				if (mapCampaign) {
					this.campaignSelected(mapCampaign);
					this.isInUnspecifiedMap = false;
				}
				else $.Warning(`Map ${GameInterfaceAPI.GetCurrentMap()} does not belong to any defined campaigns`);
			} else {
				if (mapCampaign) {
					if (!this.currentCampaign || this.currentCampaign.id !== mapCampaign.id) {
						$.Warning(`Campaign mismatch (should be ${mapCampaign.id}) while in-game. Switching...`);
						this.campaignSelected(mapCampaign);
						this.isInUnspecifiedMap = false;
					}
				}
			}
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
