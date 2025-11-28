'use strict';

class SaveEntry {
	index: number;
	panel: Panel;
	save: GameSave;

	constructor(index: number, panel: Panel, save: GameSave) {
		this.index = index;
		this.panel = panel;
		this.save = save;
	}

	update() {
		const actionBtn = this.panel.FindChildTraverse('SaveAction')!;

		actionBtn.SetPanelEvent('onactivate', () => {
			CampaignSaves.overwriteBtn.ClearPanelEvent('onmouseover');
			CampaignSaves.overwriteBtn.ClearPanelEvent('onmouseout');
			
			CampaignSaves.selectedSave = this;
			CampaignSaves.actionPanel.enabled = true;

			if (this.save.isAutoSave) {
				CampaignSaves.overwriteBtn.enabled = false;
				CampaignSaves.overwriteBtn.SetPanelEvent('onmouseover', () => {
					UiToolkitAPI.ShowTextTooltip(
						this.panel.id,
						$.Localize('#MainMenu_SaveRestore_CannotOverwriteSave')
					);
				});
				CampaignSaves.overwriteBtn.SetPanelEvent('onmouseout', () => {
					UiToolkitAPI.HideTextTooltip();
				});
			}
		});

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
			cover.SetImage(thumb);
		}
		if (del) {
			del.SetPanelEvent('onactivate', () => {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_DeleteGame_Confirm'),
					$.Localize('#Action_DeleteGame_Confirm_Message'),
					'warning-popup',
					$.Localize('#Action_DeleteGame'),
					() => {
						CampaignSaves.actionPanel.enabled = false;

						// TODO: Replace this with other save API
						const savFile: string = this.save.fileName;
						SaveRestoreAPI.DeleteSave(savFile.substring(0, savFile.length - 4));

						CampaignSaves.purgeSaveList();

						$.Schedule(0.001, () => {
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

class CampaignSaves {
	static savesPanel = $<Panel>('#CampaignSaves')!;
	static backBtn = $<Button>('#CampaignBackScreen')!;
	static stickyPanel = $<Panel>('#CampaignSaveCreateSticky')!;
	static actionPanel = $<Panel>('#CampaignSaveActions')!;
	static overwriteBtn = $<Button>('#SaveOverwrite')!;

	static saveEntries: SaveEntry[] = [];
	static createSaveBtn: Button | null = null;
	static selectedSave: SaveEntry;
	static campaign: CampaignInfo = (UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign']) as CampaignInfo;
	
	static init() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
			this.addCreateSaveBtn();
		} else {
			// can't overwrite when on menu
			this.overwriteBtn.visible = false;
		}

		this.populateSaves();
	}

	static purgeSaveList() {
		while (this.saveEntries.length > 0) this.saveEntries.pop()?.panel.DeleteAsync(0);
	}

	static populateSaves() {
		const saves = GameSavesAPI.GetGameSaves()
			.filter((v: GameSave) => { return v.mapGroup === this.campaign.id })
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		for (let i = 0; i < saves.length; ++i) {
			const p = $.CreatePanel('Panel', this.savesPanel, 'save' + i);

			p.LoadLayoutSnippet('SaveEntrySnippet');

			this.saveEntries.push(new SaveEntry(i, p, saves[i]));
			this.saveEntries[i].update();
		}
	}

	static addCreateSaveBtn() {
		this.createSaveBtn = $.CreatePanel('Button', this.stickyPanel, 'CreateSave', {
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
					CampaignSaves.purgeSaveList();
					GameSavesAPI.CreateSaveGame();
					CampaignSaves.lockScreen();

					const checkSaving = () => {
						$.Schedule(0.001, () => {
							if (GameSavesAPI.IsSaveInProgress() || GameSavesAPI.IsAutosaveInProgress()) {
								$.Schedule(0.001, checkSaving);
								return;
							}

							CampaignSaves.populateSaves();
							CampaignSaves.unlockScreen();
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
					if (this.campaign)
						CampaignAPI.ContinueCampaign(this.campaign.id);
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
			if (this.campaign)
				CampaignAPI.ContinueCampaign(this.campaign.id);
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

		this.actionPanel.enabled = false;

		// TODO: Lock navigation
	}

	static unlockScreen() {
		if (this.createSaveBtn) {
			const actionBtn = this.createSaveBtn.FindChildTraverse('SaveAction')!;
			actionBtn.enabled = this.createSaveBtn.enabled = true;
		}
	}

	static overwriteSave() {
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.Localize('#Action_OverwriteGame_Confirm'),
			$.Localize('#Action_OverwriteGame_Confirm_Message'),
			'warning-popup',
			$.Localize('#Action_OverwriteGame'),
			() => {
				// TODO: Replace this with other save API
				const savFile: string = this.selectedSave.save.fileName;
				SaveRestoreAPI.SaveGame(savFile.substring(0, savFile.length - 4));

				CampaignSaves.purgeSaveList();
				CampaignSaves.lockScreen();

				$.Schedule(1, () => {
					CampaignSaves.populateSaves();
					CampaignSaves.unlockScreen();
					this.actionPanel.enabled = true;
				});
			},
			$.Localize('#UI_Cancel'),
			() => {},
			'blur'
		);
	}

	static loadSave() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU)
			GameInterfaceAPI.ConsoleCommand(`load ${this.selectedSave.save.fileName}`);
		else {
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
				$.Localize('#Action_LoadGame_Confirm'),
				$.Localize('#Action_LoadGame_Confirm_Message'),
				'warning-popup',
				$.Localize('#Action_LoadGame'),
				() => {
					GameInterfaceAPI.ConsoleCommand(`load ${this.selectedSave.save.fileName}`);
				},
				$.Localize('#UI_Cancel'),
				() => {},
				'blur'
			);
		}
	}
}
