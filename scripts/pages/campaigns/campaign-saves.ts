'use strict';

class SaveEntry {
	campaign: CampaignPair | undefined;
	chapter: VirtualChapter | undefined;
	index: number;
	panel: Panel;
	actionPanel: Panel | null;
	save: GameSave;
	nameOverride: string | undefined = undefined;

	constructor(
		index: number,
		panel: Panel,
		save: GameSave,
		nameOverride?: string,
		campaign?: CampaignPair,
		chapter?: VirtualChapter
	) {
		this.campaign = campaign;
		this.index = index;
		this.panel = panel;
		this.save = save;
		this.actionPanel = null;
		this.nameOverride = nameOverride;
		this.campaign = campaign;
		this.chapter = chapter;
	}

	update() {
		// LOAD THE SAVE
		const playBtn = this.panel.FindChildTraverse('SaveLoad');
		if (playBtn) {
			playBtn.SetPanelEvent('onactivate', () => {
				if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU) {
					$.DispatchEvent('MainMenuCloseAllPages');
					$.DispatchEvent('LoadingScreenClearLastMap');
					$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load "${this.save.fileName}"`));
				} else {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_LoadGame_Confirm'),
						$.Localize('#Action_LoadGame_Message'),
						'warning-popup',
						$.Localize('#Action_LoadGame'),
						() => {
							$.DispatchEvent('MainMenuCloseAllPages');
							$.DispatchEvent('LoadingScreenClearLastMap');
							$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`load "${this.save.fileName}"`));
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
			if (GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU || !CampaignAPI.IsCampaignActive()) {
				saveBtn.visible = false;
			} else {
				const mapWantsSaveDisabled = GameInterfaceAPI.GetSettingBool('map_wants_save_disable');
				const isQuicksave = this.save.fileName.startsWith('quick');
				const disableSave = mapWantsSaveDisabled || this.save.isAutoSave || isQuicksave;
				if (disableSave) {
					const saveTooltip = this.panel.FindChildTraverse('SaveOverwriteTooltip');
					if (saveTooltip) {
						if (mapWantsSaveDisabled) {
							saveTooltip.SetAttributeString(
								'tooltip',
								$.Localize('#MainMenu_SaveRestore_SaveFailed_MapWantsSaveDisabled')
							);
						} else if (this.save.isAutoSave || isQuicksave) {
							saveTooltip.SetAttributeString(
								'tooltip',
								$.Localize('#MainMenu_SaveRestore_CannotOverwriteSave')
							);
						}
					}
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
						});
					},
					$.Localize('#UI_Cancel'),
					() => {},
					'blur'
				);
			});
		}

		// SELECTION STUFF
		const mainPanel = this.panel.FindChildTraverse('SaveAction')!;
		this.actionPanel = this.panel.FindChildTraverse<Panel>('SaveControls');
		const showActionPanel = () => {
			if (this.actionPanel) {
				this.actionPanel.visible = true;
			}
		};
		if (this.actionPanel) {
			const children = this.actionPanel.Children();
			for (let i = 0; i < children.length; ++i) {
				const child = children[i];
				child.SetPanelEvent('onmovedown', () => {
					const nextIndex = this.index + 1;
					if (nextIndex < CampaignSaves.saveEntries.length) {
						CampaignSaves.saveEntries[nextIndex].panel.SetFocus();
					}
				});
				child.SetPanelEvent('onmoveup', () => {
					const prevIndex = this.index - 1;
					if (prevIndex >= 0) {
						CampaignSaves.saveEntries[prevIndex].panel.SetFocus();
					} else {
						if (CampaignSaves.createSaveBtn) {
							CampaignSaves.createSaveBtn.FindChildTraverse('SaveAction')!.SetFocus();
						}
					}
				});
			}
		}
		mainPanel.SetPanelEvent('onmouseover', showActionPanel);
		mainPanel.SetPanelEvent('onfocus', () => {
			showActionPanel();
			CampaignSaves.hideActionsOnAllSaves(this.index);
			this.panel.ScrollParentToMakePanelFit(3, false);
			if (playBtn) {
				playBtn.SetFocus();
			}
		});
		mainPanel.SetPanelEvent('onmouseout', () => {
			if (this.actionPanel) {
				this.actionPanel.visible = false;
			}
		});
		mainPanel.SetPanelEvent('onmoveright', () => {
			if (this.actionPanel) {
				const children = this.actionPanel.Children();
				for (let i = 0; i < children.length; ++i) {
					const child = children[i];
					if (child.visible) {
						child.SetFocus();
						break;
					}
				}
			}
		});

		const title = this.panel.FindChildTraverse<Label>('SaveTitle');

		if (title) {
			if (this.nameOverride) {
				title.text = this.nameOverride;
			} else {
				if (!this.chapter) {
					$.Warning('CAMPAIGN SAVES: Chapter could not be found for this map');
					title.text = this.save.mapName;
				} else {
					const chapterName = $.Localize(this.chapter.title);
					title.text = chapterName.replace('\n', ': ');
				}
			}
		}

		const desc = this.panel.FindChildTraverse<Label>('SaveDesc');
		if (desc) {
			const date = new Date(Number(this.save.fileTime));
			desc.text = convertTime(date);
		}

		const bg = this.panel.FindChildTraverse<Image>('SaveBg');
		if (bg) {
			if (!this.campaign || !this.chapter) {
				bg.visible = false;
			} else {
				bg.SetImage(getChapterThumbnail(this.campaign, this.chapter));
				if (this.chapter.type === CampaignDataType.P2CE_SINGLE_WS_SPECIAL) {
					bg.style.opacity = 0.25;
				}
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
		const c = CampaignAPI.GetActiveCampaign();
		const isWsSingle = c && (isSingleWsCampaign(c!) || isSpecialSingleWsCampaign(c!));
		if (isWsSingle) {
			this.saveGroup = SpecialString.AUTO_WS;
		} else if (c) {
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
				$.Msg(`SAVED GAMES: ${v.mapGroup}, ${v.mapName}, ${v.chapter}`);
				return isWsSingle ? v.mapGroup.startsWith(this.saveGroup) : v.mapGroup === this.saveGroup;
			})
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		for (let i = 0; i < saves.length; ++i) {
			const p = $.CreatePanel('Panel', this.savesPanel, 'save' + i);
			const s = saves[i];

			p.LoadLayoutSnippet('SaveEntrySnippet');

			const realCampaign = isWsSingle ? CampaignAPI.FindCampaign(s.mapGroup) : c;
			const savChapter: VirtualChapter | undefined =
				realCampaign && s.chapter < realCampaign.campaign.chapters.length
					? realCampaign.campaign.chapters[s.chapter]
					: undefined;

			if (isWsSingle && realCampaign && savChapter) {
				savChapter.type = CampaignDataType.P2CE_SINGLE_WS_SPECIAL;
				savChapter.meta.set(
					CampaignMeta.CHAPTER_THUMBNAIL,
					WorkshopAPI.GetAddonMeta(realCampaign.bucket.addon_id).thumb
				);
			}

			this.saveEntries.push(
				new SaveEntry(
					i,
					p,
					s,
					isWsSingle ? (realCampaign ? realCampaign.campaign.title : `MISSING: ${s.mapGroup}`) : undefined,
					realCampaign ?? undefined,
					savChapter
				)
			);
			this.saveEntries[i].update();
		}

		if (this.saveEntries.length > 0) this.saveEntries[0].panel.SetFocus();
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
}
