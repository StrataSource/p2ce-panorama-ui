'use strict';

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
			const date = new Date(Number(this.save.fileTime) * 1000);
			desc.text = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		}
		if (cover) {
			const thumb = `file://{__saves}/${this.save.fileName.replace('.sav', '.tga')}`;
			$.Msg(`Save screenshot resource: ${thumb}`);
			cover.SetImage(thumb);
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
						// TODO: Replace this with other save API
						const savFile: string = this.save.fileName;
						SaveRestoreAPI.DeleteSave(savFile.substring(0, savFile.length - 4));

						CampaignSavesTab.purgeSaveList();

						$.Schedule(0.001, () => {
							CampaignSavesTab.populateSaves();
							CampaignHome.updateButtons();
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
						// TODO: Replace this with other save API
						const savFile: string = this.save.fileName;
						SaveRestoreAPI.SaveGame(savFile.substring(0, savFile.length - 4));

						CampaignSavesTab.purgeSaveList();
						CampaignSavesTab.lockScreen();

						$.Schedule(1, () => {
							CampaignSavesTab.populateSaves();
							CampaignHome.updateButtons();
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
		CampaignChaptersTab.close();
		this.purgeSaveList();
		this.addCreateSaveBtn();
		this.isSavingGame = true;
		this.populateSaves();
		this.tabLabel.text = $.Localize('#MainMenu_Campaigns_MM_SaveGame');
		this.show();
	}

	static setLoadActive() {
		this.close();
		CampaignChaptersTab.close();
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
			.filter((v: GameSave) => { return v.mapGroup === CampaignMgr.currentCampaign!.id })
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

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

					const checkSaving = () => {
						$.Schedule(0.001, () => {
							if (GameSavesAPI.IsSaveInProgress() || GameSavesAPI.IsAutosaveInProgress()) {
								$.Schedule(0.001, checkSaving);
								return;
							}

							CampaignSavesTab.populateSaves();
							CampaignHome.updateButtons();
							CampaignSavesTab.unlockScreen();
						});
					}

					checkSaving();
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
						const saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));
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
				const saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));
				GameInterfaceAPI.ConsoleCommand(`load ${saves[0].fileName}`);
			}
		}
	}

	static lockScreen() {
		if (this.createSaveBtn) {
			const actionBtn = this.createSaveBtn.FindChildTraverse('SaveAction')!;
			actionBtn.enabled = this.createSaveBtn.enabled = false;
		}
		this.backBtn.enabled = false;
	}

	static unlockScreen() {
		if (this.createSaveBtn) {
			const actionBtn = this.createSaveBtn.FindChildTraverse('SaveAction')!;
			actionBtn.enabled = this.createSaveBtn.enabled = true;
		}
		this.backBtn.enabled = true;
	}
}
