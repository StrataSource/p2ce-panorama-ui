'use strict';

class SaveEntry {
	index: number;
	panel: Panel;
	save: GameSave;

	constructor(index: number, save: GameSave) {
		this.index = index;
		this.save = save;

		const c = CampaignAPI.FindCampaign(save.mapGroup);
		const thumb = `file://{__saves}/${this.save.fileName.replace('.sav', '.tga')}`;
		const ch = c ? c.campaign.chapters[save.chapter] : undefined;
		let bg: string | undefined = undefined;
		if (c) {
			const part = ch!.meta.get(CampaignMeta.CHAPTER_THUMBNAIL);
			const basePath = getCampaignAssetPath(c);
			bg = `${basePath}${part}`;
		}

		let chapterName = ch ? ch.title : undefined;
		if (chapterName) {
			if (chapterName.startsWith('#')) {
				chapterName = $.Localize(chapterName);
			}
			const chapterNameSplits = chapterName.split('\n');
			if (chapterName.length > 1) {
				chapterName = chapterNameSplits[1];
			}
		}

		let mapName: string | undefined = undefined;
		let automapCampaign = false;
		if (ch) {
			if (isSingleWsCampaign(c!)) {
				const meta = WorkshopAPI.GetAddonMeta(c!.bucket.addon_id);
				const globalCache = UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] as Map<bigint, string[]> | undefined;
				const previews = globalCache ? (globalCache.get(meta.workshopid) ?? [meta.thumb]) : [meta.thumb];
				mapName = convertTime(new Date(Number(this.save.fileTime)), false);
				bg = previews[Math.floor(Math.random() * previews.length)];
				automapCampaign = true;
			} else {
				for (const map of ch.maps) {
					if (map.name === save.mapName) {
						mapName = map.meta.get(CampaignMeta.MAP_LIST_TITLE) ?? save.mapName;
					}
				}
			}
		}

		let indicatorText = '';
		const isQuicksave = this.save.fileName.includes('quick');
		const isAuto = this.save.isAutoSave;
		if (isQuicksave) {
			indicatorText = $.Localize('#MainMenu_SaveRestore_SaveType_quick');
		} else if (isAuto) {
			indicatorText = $.Localize('#MainMenu_SaveRestore_SaveType_autosave');
		}

		const btns: FancyListEntryBtn[] = [
			{
				id: 'LoadSave',
				icon: 'file://{images}/play.svg',
				classes: ['button'],
				tooltip: '#MainMenu_SaveRestore_Load',
				onactivate: () => {
					const loadSave = () => {
						$.DispatchEvent('MainMenuCloseAllPages');
						$.DispatchEvent('LoadingScreenClearLastMap');
						$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load "${this.save.fileName}"`));
					};
					if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
						loadSave();
					} else {
						UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
							$.Localize('#Action_LoadGame_Confirm'),
							$.Localize('#Action_LoadGame_Message'),
							'warning-popup',
							$.Localize('#Action_LoadGame'),
							() => {
								loadSave();
							},
							$.Localize('#UI_Cancel'),
							() => {},
							'blur'
						);
					}
				}
			},
			{
				id: 'OverwriteSave',
				icon: 'file://{images}/save-overwrite.svg',
				classes: ['button'],
				tooltip: '#Action_OverwriteGame',
				onactivate: () => {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_OverwriteGame_Confirm'),
						$.Localize('#Action_OverwriteGame_Confirm_Message'),
						'warning-popup',
						$.Localize('#Action_OverwriteGame'),
						() => {
							// TODO: Replace this with other save API
							const savFile: string = this.save.fileName;
							const nameWithoutExt = savFile.endsWith('.sav') ? savFile.slice(0, -4) : savFile;
							SaveRestoreAPI.SaveGame(nameWithoutExt);
							CampaignSaves.purgeSaveList();
							$.Schedule(1, () => {
								CampaignSaves.populateSaves();
							});
						},
						$.Localize('#UI_Cancel'),
						() => {},
						'blur'
					);
				}
			},
			{
				id: 'DeleteSave',
				icon: 'file://{images}/delete.svg',
				classes: ['button', 'button--red'],
				tooltip: '#Action_DeleteGame',
				onactivate: () => {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_DeleteGame_Confirm'),
						$.Localize('#Action_DeleteGame_Confirm_Message'),
						'warning-popup',
						$.Localize('#Action_DeleteGame'),
						() => {
							// TODO: Replace this with other save API
							const savFile: string = this.save.fileName;
							const nameWithoutExt = savFile.endsWith('.sav') ? savFile.slice(0, -4) : savFile;
							SaveRestoreAPI.DeleteSave(nameWithoutExt);

							CampaignSaves.purgeSaveList();

							$.Schedule(0.001, () => {
								CampaignSaves.populateSaves();
							});
						},
						$.Localize('#UI_Cancel'),
						() => {},
						'blur'
					);
				}
			}
		];

		if (GameInterfaceAPI.GetGameUIState() !== GameUIState.PAUSEMENU || CampaignSaves.saveGroup.length === 0) {
			btns.splice(1, 1);
		}

		this.panel = FancyList_CreateEntry(
			CampaignSaves.savesPanel,
			{
				id: this.save.fileName,
				genericIndicator: { text: indicatorText, show: indicatorText.length > 0 },
				image: thumb,
				bgImage: bg,
				title: { text: mapName ? mapName : save.mapName },
				subtitle: chapterName ? { text: chapterName } : undefined,
				mini: !automapCampaign ? { text: convertTime(new Date(Number(this.save.fileTime)), false) } : undefined,
				buttons: btns
			},
			'Panel'
		) as Panel;
	}
}

class CampaignSaves {
	static savesPanel = $<Panel>('#CampaignSaves')!;
	static savesBtn = $<Button>('#CreateSaveBtn')!;

	static saveEntries: SaveEntry[] = [];
	static createSaveBtn: Button | null = null;
	static saveGroup = '';

	static hideActionsOnAllSaves(excludeIndex: number) {
		for (let i = 0; i < this.saveEntries.length; ++i) {
			if (i === excludeIndex) continue;

			const saveEntry = this.saveEntries[i];
			if (!saveEntry.panel.IsValid()) continue;

			const p = saveEntry.panel.FindChildTraverse<Panel>('SaveControls');

			if (p && p.visible) {
				p.visible = false;
			}
		}
	}

	static init() {
		if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU && CampaignAPI.IsCampaignActive()) {
			this.setCreateSaveState();
			$.DispatchEvent(
				'MainMenuSetPageLines',
				$.Localize('#MainMenu_SaveRestore_Main'),
				$.Localize('#MainMenu_SaveRestore_Main_Tagline')
			);
		} else {
			this.savesBtn.visible = false;
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
		const c = CampaignAPI.GetActiveCampaign();
		if (c) {
			this.saveGroup = `${c.bucket.id}/${c.campaign.id}`;
		} else {
			UiToolkitAPI.ShowGenericPopupOk(
				$.Localize('#MainMenu_Campaigns_NoActiveCampaign_Warning_Title'),
				$.Localize('#MainMenu_Campaigns_NoActiveCampaign_Warning_Desc'),
				'bad-popup',
				() => {}
			);
			this.saveGroup = '';
		}

		const saves = GameSavesAPI.GetGameSaves()
			.filter((v: GameSave) => {
				return v.mapGroup === this.saveGroup;
			})
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		for (let i = 0; i < saves.length; ++i) {
			const s = saves[i];
			this.saveEntries.push(new SaveEntry(i, s));
		}
	}

	static setCreateSaveState() {
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

	static save() {
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.Localize('#Action_NewSave_Confirm'),
			$.Localize('#Action_NewSave_Confirm_Message'),
			'generic-popup',
			$.Localize('#UI_Yes'),
			() => {
				CampaignSaves.purgeSaveList();
				GameSavesAPI.CreateSaveGame();

				const checkSaving = () => {
					$.Schedule(1, () => {
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
	}
}
