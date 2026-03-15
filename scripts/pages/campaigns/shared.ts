'use strict';

interface CampaignDropDownValue {
	text: string;
	value: string;
}

class CampaignSetting {
	name: string;
	helpText: string;
	// default, in the case of a dropdown, refers to the INDEX of the option, NOT the value (if it is a number)
	// see the skill setting for example
	def: unknown;
	command: string;
	panelType: keyof PanelTagNameMap | undefined;
	dropDownValues?: Array<CampaignDropDownValue>;
	currentValue: unknown | undefined;
	extra?: unknown;

	constructor(
		name: string,
		helpText: string,
		def: unknown,
		command: string,
		panelType: keyof PanelTagNameMap | undefined,
		dropDownValues?: Array<CampaignDropDownValue>
	) {
		this.name = name;
		this.helpText = helpText;
		this.def = def;
		this.command = command;
		this.panelType = panelType;
		this.dropDownValues = dropDownValues;
	}
}

class CampaignSettingField {
	id: string;
	name: string;
	command: string;
	panel: GenericPanel;
	default: unknown;
	value: unknown;

	constructor(id: string, name: string, command: string, panel: GenericPanel, defaultValue: unknown) {
		this.id = id;
		this.name = name;
		this.command = command;
		this.panel = panel;
		this.default = defaultValue;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setValue(value: any) {
		this.value = value;
	}
}

class CampaignShared {
	static inputFields: Array<CampaignSettingField> = [];

	static setup() {
		// this is a global object that gets set every time the main campaign settings screen is invoked
		// separated by category, this holds a record of all adjustable convars
		//
		// NOTE: this is a prototype only and will likely not make it into the final version, as a more "concrete"
		// system in the backend will probably sit in place of this. for this reason, DO NOT LOCALIZE.
		// for now though, for fun, this works fine
		(UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
			string,
			Record<string, CampaignSetting>
		>) = {
			GameplayBase: {
				mirrorWorld: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_cl_mirror_world'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_cl_mirror_world_Description'),
					def: false,
					command: 'cl_mirror_world',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				gravity: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_gravity'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_gravity_Description'),
					def: 600,
					command: 'sv_gravity',
					// numberentry only supports integers
					panelType: 'TextEntry',
					currentValue: undefined
				},
				//skill: {
				//	name: $.Localize('#MainMenu_Campaigns_Setup_Var_skill'),
				//	helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_skill_Description'),
				//	def: '1',
				//	command: 'skill',
				//	panelType: 'DropDown',
				//	dropDownValues: [
				//		{
				//			text: $.Localize('#MainMenu_Campaigns_Setup_Var_skill_1'),
				//			value: '1'
				//		},
				//		{
				//			text: $.Localize('#MainMenu_Campaigns_Setup_Var_skill_2'),
				//			value: '2'
				//		},
				//		{
				//			text: $.Localize('#MainMenu_Campaigns_Setup_Var_skill_3'),
				//			value: '3'
				//		}
				//	],
				//	currentValue: undefined
				//},
				throw: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_player_throwenable'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_player_throwenable_Description'),
					def: false,
					command: 'player_throwenable',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				throwForce: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_player_throwforce'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_player_throwforce_Description'),
					def: '1000',
					command: 'player_throwforce',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				holdRot: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_enableholdrotation'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_enableholdrotation_Description'),
					def: false,
					command: 'sv_enableholdrotation',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				prefCarry: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_enablepreferredcarry'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_enablepreferredcarry_Description'),
					def: true,
					command: 'sv_enablepreferredcarry',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				bhop: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_mv_bhop'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_mv_bhop_Description'),
					def: false,
					command: 'mv_bhop',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				crouchJump: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_mv_duckjump'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_mv_duckjump_Description'),
					def: false,
					command: 'mv_duckjump',
					panelType: 'ToggleButton',
					currentValue: undefined
				}
			},
			ServerSettings: {
				hostname: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_hostname'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_hostname_Description'),
					def: `${FriendsAPI.GetLocalPlayerName()}'s game`,
					command: 'hostname',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				tags: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_tags'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_tags_Description'),
					def: '',
					command: 'sv_tags',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				maxplayers: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_maxplayers'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_maxplayers_Description'),
					def: '1',
					command: 'maxplayers',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				password: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_password'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_password_Description'),
					def: '',
					command: 'sv_password',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				lan: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_lan'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_lan_Description'),
					def: false,
					command: 'sv_lan',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				cheats: {
					name: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_cheats'),
					helpText: $.Localize('#MainMenu_Campaigns_Setup_Var_sv_cheats_Description'),
					def: false,
					command: 'sv_cheats',
					panelType: 'ToggleButton',
					currentValue: undefined
				}
			},
			Map: {
				map: {
					name: 'Map',
					helpText: '[HC] Map',
					def: '',
					command: '',
					panelType: undefined,
					currentValue: ''
				}
			}
		};

		const settings = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
			string,
			Record<string, CampaignSetting>
		>;
		for (const group of Object.values(settings)) {
			for (const setting of Object.values(group)) {
				setting.currentValue = setting.def;
			}
		}

		const map = (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_ACTIVE_CHAPTER] as ChapterInfo).maps[0] ?? '';
		settings['Map']['map'].def = map.name;
		settings['Map']['map'].currentValue = map.name;
	}

	static constructPage() {
		const parent = $<Panel>('#SettingPageInsert')!;

		const settings = (
			UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
				string,
				Array<CampaignSetting>
			>
		)[$.GetContextPanel().id];

		Object.entries(settings).forEach((v: [string, CampaignSetting], i: number) => {
			const id = v[0];
			const setting = v[1];

			if (setting.panelType === undefined) return;

			const helpWrapper = $.CreatePanel('TooltipPanel', parent, `${id}_TT`, {
				tooltip: setting.helpText
			});
			helpWrapper.AddClass('campaign-setting__tooltip');

			const wrapper = $.CreatePanel('Panel', helpWrapper, `${id}_Wrapper`, {
				class: 'campaign-setting__entry'
			});

			wrapper.SetHasClass('campaign-setting__entry__odd', i % 2 === 0);

			$.CreatePanel('Label', wrapper, `${id}_Text`, {
				class: 'campaign-setting__entry__text',
				text: setting.name
			});

			let inputClassPrefix = '';
			switch (setting.panelType) {
				case 'ToggleButton':
					inputClassPrefix = 'checkbox campaign-setting__entry__checkbox';
					break;

				case 'TextEntry':
					inputClassPrefix = 'textentry campaign-setting__entry__textentry';
					break;

				case 'DropDown':
					inputClassPrefix = 'dropdown campaign-setting__entry__dropdown';
					break;

				default:
					throw new Error('This panel type is not supported as a setting widget.');
					break;
			}

			const inputter = $.CreatePanel(setting.panelType, wrapper, `${id}_Input`, {
				class: `campaign-setting__entry__value ${inputClassPrefix}`,
				menuclass: 'dropdown-menu'
			});

			if (setting.panelType === 'DropDown') {
				if (!setting.dropDownValues) {
					$.Warning(
						`CAMPAIGN SETTINGS: Campaign setting ${id} is of type DropDown but does not specify any values.`
					);
					throw new Error(`Campaign setting ${id} is of type DropDown but does not specify any values.`);
				}

				for (let i = 0; i < setting.dropDownValues.length; ++i) {
					const value = setting.dropDownValues[i];
					const o = $.CreatePanel('Label', inputter, `${id}${value.value}`, {
						text: value.text,
						value: value.value,
						index: i
					});
					(inputter as DropDown).AddOption(o);
				}
			}

			switch (setting.panelType) {
				case 'ToggleButton':
					(inputter as ToggleButton).SetSelected(setting.currentValue as boolean);
					inputter.SetPanelEvent('onactivate', () => {
						this.onPreClose($.GetContextPanel().id);
					});
					break;

				case 'TextEntry':
					(inputter as TextEntry).text = setting.currentValue as string;
					inputter.SetPanelEvent('ontextentrysubmit', () => {
						this.onPreClose($.GetContextPanel().id);
					});
					break;

				case 'DropDown':
					(inputter as DropDown).SetSelectedIndex(Number(setting.currentValue));
					inputter.SetPanelEvent('oninputsubmit', () => {
						this.onPreClose($.GetContextPanel().id);
					});
					break;

				default:
					throw new Error('This panel type is not supported as a setting widget.');
					break;
			}

			this.inputFields.push(
				new CampaignSettingField(id, setting.name, setting.command, inputter, setting.currentValue)
			);
		});

		$.RegisterForUnhandledEvent('MainMenuPagePreClose', this.onPreClose.bind(this));
	}

	static onPreClose(tab: string) {
		if (tab !== $.GetContextPanel().id) {
			return;
		}

		const settings = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
			string,
			Array<CampaignSetting>
		>;

		for (const field of this.inputFields) {
			const s = settings[$.GetContextPanel().id][field.id] as CampaignSetting;
			const p = field.panel;
			switch (p.paneltype) {
				case 'ToggleButton': {
					const newValue = (p as ToggleButton).IsSelected() ? 1 : 0;
					if (s.currentValue !== newValue)
						$.Msg(`Setting '${s.command}' is now [VALUE: '${newValue}', DEFAULT: '${s.def}']`);
					s.currentValue = newValue;
					break;
				}

				case 'TextEntry': {
					const newValue = (p as TextEntry).text;
					if (s.currentValue !== newValue)
						$.Msg(`Setting '${s.command}' is now [VALUE: '${newValue}', DEFAULT: '${s.def}']`);
					s.currentValue = newValue;
					break;
				}

				case 'DropDown': {
					const newValue = (p as DropDown).GetSelected().GetAttributeInt('index', -1);
					if (s.currentValue !== newValue)
						$.Msg(`Setting '${s.command}' is now [VALUE: '${newValue}', DEFAULT: '${s.def}']`);
					s.currentValue = newValue;
					if (field.value === -1) throw new Error('Unable to retrieve index from DropDown Field');
					break;
				}
				default:
					throw new Error('This panel type is not supported as a setting widget.');
					break;
			}
		}

		$.DispatchEvent('CampaignMenuRefreshUserSettings');
	}

	static setMap(map: string, index: number) {
		const settings = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
			string,
			Record<string, CampaignSetting>
		>;
		const setting = settings['Map']['map'];
		setting.currentValue = map;
		setting.extra = index;
	}

	static getMap() {
		const settings = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<
			string,
			Record<string, CampaignSetting>
		>;
		const setting = settings['Map']['map'];
		return {
			mapname: String(setting.currentValue),
			index: Number(setting.extra)
		};
	}
}
