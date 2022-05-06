'use strict'

class MainMenuSettings {

	// Information on how it works:
	// TODO

	// Todo: Can we get somebody to double check that this is all fine?
	// Todo: Convert this to an external file, this is shit
	static videoSettings = {
		"#UI_Settings_Video": {
			ColorMode: {
				text: "#UI_Settings_ColorMode",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			brightness: {
				text: "#GameUI_Brightness",
				type: "ChaosSettingsSlider",
				min: "1.6",
				max: "2.6",
				percentage: true,
				convar: "mat_monitorgamma"
			},
			AspectRatioEnum: {
				text: "#UI_Settings_Aspect_Ratio",
				type: "ChaosSettingsEnumDropDown",
				oninputsubmit: "ChaosAspectRatioSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			ResolutionEnum: {
				text: "#UI_Settings_Resolution",
				type: "ChaosSettingsEnumDropDown",
				oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			DisplayModeEnum: {
				text: "#UI_Settings_Display_Mode",
				type: "ChaosSettingsEnumDropDown",
				oninputsubmit: "ChaosDisplayModeSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			PowerSavingsMode: {
				text: "#UI_Settings_Laptop_Power",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosDisplayModeSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
		},
		"#UI_Settings_Rendering": {
			// Todo: order these
			CSMQualityLevel: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			ModelTextureDetail: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			EffectDetail: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			ShaderDetail: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			FilteringMode: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			AAMode: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			FXAA: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			VSync: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			MatQueueMode: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			MotionBlur: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			DynamicTonemapping: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			DisableBloom: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
			ColorCorrection: {
				text: "todo pls",
				type: "ChaosSettingsEnumDropDown",
				//oninputsubmit: "ChaosResolutionSelectionChanged()",
				values: {
					"resolution0": {
						text: "0",
						value: "0"
					}
				}
			},
		},
		"Empty": {
			/*
			fovDesired: {
				text: "#GameUI_FOV",
				type: "ChaosSettingsSlider",
				min: 50, // TODO: Check what we will use here!
				max: 130,
				percentage: false,
				convar: "fov_desired"
			},
			colorMode: {
				text: "Color Mode",
				type: "ChaosSettingsEnumDropDown",
				values: {
					"tvmode0": {
						text: "#GameUI_DisplayMonitor",
						value: 0
					},
					"tvmode1": {
						text: "#GameUI_DisplayTV",
						value: 0
					}
				}
			},
			aspectRatio: {
				text: "Aspect Ratio",
				type: "ChaosSettingsEnumDropDown",
				oninputsubmit: "ChaosAspectRatioSelectionChanged()",
				values: {
					"aspectratio0": {
						text: "#UI_Settings_Normal",
						value: 0
					},
					"aspectratio1": {
						text: "#UI_Settings_Widescreen_16_9",
						value: 1
					},
					"aspectratio2": {
						text: "#UI_Settings_Widescreen_16_10",
						value: 2
					},
				}
			},
			testEnum: {
				text: "A test enum",
				convar: "test22",
				type: "ChaosSettingsEnum",
				values: {
					"testEnum1": {
						group: "testgroup",
						text: "test 1",
						value: 1
					},
					"testEnum2": {
						group: "testgroup",
						text: "test 2",
						value: 2
					}
				}
			},
			testToggle: {
				text: "A test toggle",
				type: "ChaosSettingsToggle",
				convar: "test"
			},
			testKeybind: {
				text: "A test keybind",
				type: "ChaosSettingsKeyBinder",
				bind: "+forward"
			}
			*/
		}	
	}

	//static settingsPanel = $.GetContextPanel().FindChildTraverse("root-settings");
	static settingsPanel = $.GetContextPanel().FindChildTraverse("settings-root");

	static {
		// Create our panels
		//<ChaosVideoSettings id="root-settings" style="flow-children: down">
		//</ChaosVideoSettings>

		/*
		const vidSetPanel = $.CreatePanel("ChaosVideoSettings", this.settingsPanel, "settings-video", {
			style: "flow-children: down; overflow: squish scroll;"
		});

		MainMenuSettings.parseOptions(vidSetPanel, this.videoSettings);

		$.DispatchEvent('ChaosVideoSettingsInit');
		*/
	}

	static parseOptions(setPar, setObj) {
		$.Msg(setPar);
		Object.entries(setObj).forEach(([sbGrpName, sbGrpValue]) => {
			//$.Msg(sbGrpName)
			
			$.CreatePanel("Label", setPar, "test", {
				text: sbGrpName,
			});

			Object.entries(sbGrpValue).forEach(([optName, optValue]) => {
				//$.Msg(optName)
				switch (optValue["type"]) {
					case "ChaosSettingsEnumDropDown":
						this.CreateEnumDropDown(setPar, optName, optValue);
						break;
					case "ChaosSettingsEnum":
						this.CreateEnum(setPar, optName, optValue);
						break;
					case "ChaosSettingsSlider":
						this.CreateSlider(setPar, optName, optValue);
						break;
					case "ChaosSettingsKeyBinder":
						this.CreateKeyBinder(setPar, optName, optValue);
						break;
					case "ChaosSettingsToggle":
						this.CreateToggle(setPar, optName, optValue);
						break;
					default:
						$.Warning(`[Settings] Could not find panel type for ${optName}. Panel type given was ${optValue["type"]}`);
						break;
				}
			});
		});


		//$.DispatchEvent('ChaosVideoSettingsInit');
	}

	/* Internal methods */

	// These create ChaosSettings versions of
	// the components. These are just split up
	// for the sake of sanity reasons.
	// parent = panel that it will be attached too
	// id = raw name of the option
	// option = js object that contains option settings

	static CreateEnumDropDown(parent, id, option) {
		const enumDropdown = $.CreatePanel("ChaosSettingsEnumDropDown", parent, id, {
			text: option["text"],
		});

		if (option["convar"]) {
			enumDropdown.convar = option["convar"];
		}

		if (option["oninputsubmit"]) {
			enumDropdown.oninputsubmit = option["oninputsubmit"];
		}

		if (option["infomessage"]) {
			slider.infomessage = option["infomessage"];
		}

		// !!!DO NOT CHANGE THIS IN THE LAYOUT OTHERWISE THIS BREAKS!!!
		const dropdown = enumDropdown.FindChildTraverse("DropDown");

		Object.entries(option["values"]).forEach(([valName, value]) => {
			const ddOpt = $.CreatePanel("Label", dropdown, valName, {
				text: value["text"],
				value: value["value"]
			});

			dropdown.AddOption(ddOpt);
			dropdown.SetSelected(ddOpt);
		});
	}

	static CreateEnum(parent, id, option) {
		const setEnum = $.CreatePanel("ChaosSettingsEnum", parent, id, {
			text: option["text"],
			convar: option["convar"]
		});
		const btnPanel = setEnum.FindChildTraverse("values");

		if (option["infomessage"]) {
			setEnum.infomessage = option["infomessage"];
		}

		Object.entries(option["values"]).forEach(([valName, value]) => {
			$.CreatePanel("RadioButton", btnPanel, valName, {
				group: value["group"],
				text: value["text"],
				value: value["value"]
			});
		});
	}

	static CreateSlider(parent, id, option) {
		const slider = $.CreatePanel("ChaosSettingsSlider", parent, id, {
			text: option["text"],
			min: option["min"],
			max: option["max"],
			percentage: option["percentage"],
			convar: option["convar"],
		});

		if (option["infomessage"]) {
			slider.infomessage = option["infomessage"];
		}
	}

	static CreateKeyBinder(parent, id, option) {
		$.CreatePanel("ChaosSettingsKeyBinder", parent, id, {
			text: option["text"],
			bind: option["bind"]
		});
	}

	static CreateToggle(parent, id, option) { 
		$.CreatePanel("ChaosSettingsToggle", parent, id, {
			text: option["text"],
			convar: option["convar"]
		});
	}
}
