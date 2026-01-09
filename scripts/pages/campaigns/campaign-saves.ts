'use strict';

class SaveEntry {
	index: number;
	panel: Panel;
	actionPanel: Panel | null;
	save: GameSave;

	constructor(index: number, panel: Panel, save: GameSave) {
		this.index = index;
		this.panel = panel;
		this.save = save;
		this.actionPanel = null;
	}

	update() {
		// LOAD THE SAVE
		const playBtn = this.panel.FindChildTraverse('SaveLoad');
		if (playBtn) {
			playBtn.SetPanelEvent('onactivate', () => {
				if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
					$.DispatchEvent('MainMenuCloseAllPages');
					$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load ${this.save.fileName}`));
				} else {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_LoadGame_Confirm'),
						$.Localize('#Action_LoadGame_Message'),
						'warning-popup',
						$.Localize('#Action_LoadGame'),
						() => {
							$.DispatchEvent('MainMenuCloseAllPages');
							$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load ${this.save.fileName}`));
						},
						$.Localize('#UI_Cancel'),
						() => {},
						'blur'
					);
				}
			});
		}

		// OVERWRITE THE SAVE
		const saveBtn = this.panel.FindChildTraverse('SaveOverwrite');
		if (saveBtn) {
			if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
				saveBtn.visible = false;
			} else {
				const disableSave = GameInterfaceAPI.GetSettingBool('map_wants_save_disable') || this.save.isAutoSave;
				if (disableSave) {
					saveBtn.SetPanelEvent('onmouseover', () => {
						UiToolkitAPI.ShowTextTooltip(
							saveBtn.id,
							$.Localize('#MainMenu_SaveRestore_SaveFailed_MapWantsSaveDisabled')
						);
					});
					saveBtn.SetPanelEvent('onmouseout', () => {
						UiToolkitAPI.HideTextTooltip();
					});
					saveBtn.enabled = false;
				} else {
					saveBtn.SetPanelEvent('onactivate', () => {
						UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
							$.Localize('#Action_OverwriteGame_Confirm'),
							$.Localize('#Action_OverwriteGame_Confirm_Message'),
							'warning-popup',
							$.Localize('#Action_OverwriteGame'),
							() => {
								// TODO: Replace this with other save API
								const savFile: string = this.save.fileName;
								SaveRestoreAPI.SaveGame(savFile.substring(0, savFile.length - 4));

								CampaignSaves.purgeSaveList();

								$.Schedule(1, () => {
									CampaignSaves.populateSaves();
								});
							},
							$.Localize('#UI_Cancel'),
							() => {},
							'blur'
						);
					});
				}
			}
		}

		// DELETE THE SAVE
		const del = this.panel.FindChildTraverse<Button>('SaveDelete');
		if (del) {
			del.SetPanelEvent('onactivate', () => {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_DeleteGame_Confirm'),
					$.Localize('#Action_DeleteGame_Confirm_Message'),
					'warning-popup',
					$.Localize('#Action_DeleteGame'),
					() => {
						// TODO: Replace this with other save API
						const savFile: string = this.save.fileName;
						SaveRestoreAPI.DeleteSave(savFile.substring(0, savFile.length - 4));

						CampaignSaves.purgeSaveList();

						$.Schedule(0.001, () => {
							CampaignSaves.populateSaves();
							$.DispatchEvent('MainMenuSetFocus');
						});
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			});
		}

		const mainPanel = this.panel.FindChildTraverse('SaveAction')!;
		this.actionPanel = this.panel.FindChildTraverse<Panel>('SaveControls');
		mainPanel.SetPanelEvent('onmouseover', () => {
			if (this.actionPanel) {
				this.actionPanel.visible = true;
			}
		});
		mainPanel.SetPanelEvent('onmouseout', () => {
			if (this.actionPanel) {
				this.actionPanel.visible = false;
			}
		});

		const title = this.panel.FindChildTraverse<Label>('SaveTitle');
		const savChapter = CampaignSaves.campaign.chapters.find((ch) => {
			return (
				ch.maps.find((map) => {
					return map.name === this.save.mapName || map.name === `${this.save.mapName}.bsp`;
				}) !== undefined
			);
		});
		if (title) {
			if (!savChapter) {
				$.Warning('CONTINUE: Chapter could not be found for this map');
				title.text = this.save.mapName;
			} else {
				title.text = $.Localize(savChapter.title);
			}
		}

		const desc = this.panel.FindChildTraverse<Label>('SaveDesc');
		if (desc) {
			const date = new Date(Number(this.save.fileTime) * 1000);
			desc.text = convertTime(date);
		}

		const bg = this.panel.FindChildTraverse<Image>('SaveBg');
		if (bg) {
			if (!savChapter) {
				bg.visible = false;
			} else {
				bg.SetImage(convertImagePath(savChapter.thumbnail));
			}
		}

		const cover = this.panel.FindChildTraverse<Image>('SaveCover');
		if (cover) {
			const thumb = `file://{__saves}/${this.save.fileName.replace('.sav', '.tga')}`;
			cover.SetImage(thumb);
		}

		const type = this.panel.FindChildTraverse<Label>('SaveType');
		if (type) {
			const isQuicksave = this.save.fileName.includes('quick');
			const isAuto = this.save.isAutoSave;

			type.visible = isQuicksave || isAuto;

			if (isQuicksave) {
				type.text = $.Localize('#MainMenu_SaveRestore_SaveType_quick');
			} else if (isAuto) {
				type.text = $.Localize('#MainMenu_SaveRestore_SaveType_autosave');
			}
		}

		const cloud = this.panel.FindChildTraverse<Image>('SaveCloud');
		if (cloud) {
			if (!this.save.isSavedInCloud) {
				cloud.SetImage('file://{images}/save.svg');
			}
		}
	}
}

class CampaignSaves {
	static savesPanel = $<Panel>('#CampaignSaves')!;
	static backBtn = $<Button>('#CampaignBackScreen')!;
	static stickyPanel = $<Panel>('#CampaignSaveCreateSticky')!;

	static saveEntries: SaveEntry[] = [];
	static createSaveBtn: Button | null = null;
	static campaign: CampaignInfo = UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] as CampaignInfo;

	static init() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			this.addCreateSaveBtn();
			$.DispatchEvent(
				'MainMenuSetPageLines',
				$.Localize('#MainMenu_SaveRestore_Main'),
				$.Localize('#MainMenu_SaveRestore_Main_Tagline')
			);
		} else {
			$.DispatchEvent(
				'MainMenuSetPageLines',
				$.Localize('#MainMenu_SaveRestore_Load'),
				$.Localize('#MainMenu_SaveRestore_Main_Tagline')
			);
		}

		this.populateSaves();
	}

	static purgeSaveList() {
		while (this.saveEntries.length > 0) this.saveEntries.pop()?.panel.DeleteAsync(0);
	}

	static populateSaves() {
		const saves = GameSavesAPI.GetGameSaves()
			.filter((v: GameSave) => {
				$.Msg(`${v.mapGroup}, ${v.mapName}, ${v.chapter}`);
				return v.mapGroup === this.campaign.id;
			})
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		for (let i = 0; i < saves.length; ++i) {
			const p = $.CreatePanel('Panel', this.savesPanel, 'save' + i);

			p.LoadLayoutSnippet('SaveEntrySnippet');

			this.saveEntries.push(new SaveEntry(i, p, saves[i]));
			this.saveEntries[i].update();
		}
	}

	static addCreateSaveBtn() {
		// create the button
		this.createSaveBtn = $.CreatePanel('Button', this.stickyPanel, 'CreateSave');
		this.createSaveBtn.LoadLayoutSnippet('CreateSaveSnippet');

		// set save action
		this.createSaveBtn.SetPanelEvent('onactivate', () => {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_NewSave_Confirm'),
				$.Localize('#Action_NewSave_Confirm_Message'),
				'generic-popup',
				$.Localize('#UI_Yes'),
				() => {
					CampaignSaves.purgeSaveList();
					GameSavesAPI.CreateSaveGame();

					const checkSaving = () => {
						$.Schedule(0.001, () => {
							if (GameSavesAPI.IsSaveInProgress() || GameSavesAPI.IsAutosaveInProgress()) {
								$.Schedule(0.001, checkSaving);
								return;
							}

							CampaignSaves.populateSaves();
						});
					};

					checkSaving();
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		});

		// disable save creation if desired

		const noSave = GameInterfaceAPI.GetSettingBool('map_wants_save_disable');
		if (!noSave) return;

		if (this.createSaveBtn) {
			const actionBtn = this.createSaveBtn.FindChildTraverse('SaveAction')!;
			actionBtn.enabled = this.createSaveBtn.enabled = false;

			this.createSaveBtn.SetPanelEvent('onmouseover', () => {
				UiToolkitAPI.ShowTextTooltip(
					this.createSaveBtn!.id,
					$.Localize('#MainMenu_SaveRestore_SaveFailed_MapWantsSaveDisabled')
				);
			});

			this.createSaveBtn.SetPanelEvent('onmouseout', () => {
				UiToolkitAPI.HideTextTooltip();
			});
		}
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
					if (this.campaign) {
						$.DispatchEvent('MainMenuCloseAllPages');
						$.Schedule(0.001, () => CampaignAPI.ContinueCampaign(this.campaign.id));
					} else {
						const saves = GameSavesAPI.GetGameSaves().sort(
							(a, b) => Number(b.fileTime) - Number(a.fileTime)
						);
						$.DispatchEvent('MainMenuCloseAllPages');
						$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load ${saves[0].fileName}`));
					}
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		} else {
			if (this.campaign) {
				$.DispatchEvent('MainMenuCloseAllPages');
				$.Schedule(0.001, () => CampaignAPI.ContinueCampaign(this.campaign.id));
			} else {
				const saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));
				$.DispatchEvent('MainMenuCloseAllPages');
				$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load ${saves[0].fileName}`));
			}
		}
	}
}
