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
	panelType: keyof PanelTagNameMap;
	dropDownValues?: Array<CampaignDropDownValue>;
	currentValue: unknown | undefined;

	constructor(
		name: string,
		helpText: string,
		def: unknown,
		command: string,
		panelType: keyof PanelTagNameMap,
		dropDownValues?: Array<CampaignDropDownValue>,
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
		(UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<string, Record<string, CampaignSetting>>) = {
			'GameplayBase': {
				'mirrorWorld': {
					name: 'Mirror World',
					helpText: '[HC] Flips the world horizontally.\n\nDefault: FALSE',
					def: false,
					command: 'cl_mirror_world',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				'gravity': {
					name: 'Gravity',
					helpText: '[HC] Adjust the world gravity.\n\ndefault: 600',
					def: 600,
					command: 'sv_gravity',
					// numberentry only supports integers
					panelType: 'TextEntry',
					currentValue: undefined
				},
				'skill': {
					name: 'Difficulty',
					helpText:
						'[HC] Sets the skill level and affects how much damage is dealt/taken. Does not apply to Portal campaigns.\n\ndefault: Normal',
					def: '1',
					command: 'skill',
					panelType: 'DropDown',
					dropDownValues: [
						{
							text: 'Easy',
							value: '1'
						},
						{
							text: 'Medium',
							value: '2'
						},
						{
							text: 'Hard',
							value: '3'
						}
					],
					currentValue: undefined
				},
				'throw': {
					name: 'Enable Throw',
					helpText: '[HC] Enable throw',
					def: false,
					command: 'player_throwenable',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				'throwForce': {
					name: 'Throw Force',
					helpText: '[HC] Throw',
					def: '1000',
					command: 'player_throwforce',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				'bhop': {
					name: 'Enable Bunnyhop Speed Boost',
					helpText: '[HC] Enable bhop speed',
					def: false,
					command: 'mv_bhop',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				'crouchJump': {
					name: 'Enable Crouch Jumping',
					helpText: '[HC] Enable duckjump',
					def: false,
					command: 'mv_duckjump',
					panelType: 'ToggleButton',
					currentValue: undefined
				}
			},
			'ServerSettings': {
				'hostname': {
					name: 'Server Name',
					helpText: '[HC] Server Name',
					def: `${FriendsAPI.GetLocalPlayerName()}'s game`,
					command: 'hostname',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				'maxplayers': {
					name: 'Maximum Player Count',
					helpText: '[HC] Max players',
					def: '1',
					command: 'maxplayers',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				'password': {
					name: 'Server Password',
					helpText: '[HC] Server password',
					def: '',
					command: 'sv_password',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				'lan': {
					name: 'LAN Only',
					helpText: '[HC] LAN',
					def: false,
					command: 'sv_lan',
					panelType: 'ToggleButton',
					currentValue: undefined
				},
				'tags': {
					name: 'Server Browser Tags',
					helpText: '[HC] Tags',
					def: '',
					command: 'sv_tags',
					panelType: 'TextEntry',
					currentValue: undefined
				},
				'cheats': {
					name: 'Server Cheats',
					helpText:
						'[HC] Enable <pre>sv_cheats 1</pre> and allow the usage of commands that require it, such as <pre>noclip</pre>.\n\nDefault: false',
					def: false,
					command: 'sv_cheats',
					panelType: 'ToggleButton',
					currentValue: undefined
				}
			}
		};

		const settings = (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<string, Array<CampaignSetting>>);
		for (const group of Object.values(settings)) {
			for (const setting of Object.values(group)) {
				setting.currentValue = setting.def;
			}
		}
	}

	static constructPage() {
		const parent = $<Panel>('#SettingPageInsert')!;

		const settings = (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<string, Array<CampaignSetting>>)[$.GetContextPanel().id];

		Object.entries(settings).forEach((v: [string, CampaignSetting], i: number) => {
			const id = v[0];
			const setting = v[1];

			const wrapper = $.CreatePanel('Panel', parent, `${id}_Wrapper`, {
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
					throw new Error(
						`Campaign setting ${id} is of type DropDown but does not specify any values.`
					);
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
					break;

				case 'TextEntry':
					(inputter as TextEntry).text = setting.currentValue as string;
					(inputter as TextEntry).RaiseChangeEvents(true);
					break;

				case 'DropDown':
					(inputter as DropDown).SetSelectedIndex(Number(setting.currentValue));
					break;

				default:
					throw new Error('This panel type is not supported as a setting widget.');
					break;
			}

			this.inputFields.push(
				new CampaignSettingField(
					id,
					setting.name,
					setting.command,
					inputter,
					setting.currentValue
				)
			);
		});

		$.RegisterForUnhandledEvent('MainMenuPagePreClose', this.onPreClose.bind(this));
	}

	static onPreClose(tab: string) {
		if (tab !== $.GetContextPanel().id) {
			return;
		}

		$.Msg('Collecting setting changes...');

		const settings = (UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTINGS] as Record<string, Array<CampaignSetting>>);

		for (const field of this.inputFields) {
			const s = (settings[$.GetContextPanel().id][field.id] as CampaignSetting);
			const p = field.panel;
			switch (p.paneltype) {
				case 'ToggleButton':
					s.currentValue = Number((p as ToggleButton).IsSelected());
					break;

				case 'TextEntry':
					s.currentValue = (p as TextEntry).text;
					break;

				case 'DropDown':
					s.currentValue = (p as DropDown).GetSelected().GetAttributeInt('index', -1);
					if (field.value === -1) throw new Error('Unable to retrieve index from DropDown Field');
					break;

				default:
					throw new Error('This panel type is not supported as a setting widget.');
					break;
			}

			$.Msg(`Setting '${s.command}' is now [VALUE: '${s.currentValue}', DEFAULT: '${s.def}']`);
		}
	}
}
