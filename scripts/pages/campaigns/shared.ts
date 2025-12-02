'use strict';

declare const enum SettingPages {
	NONE = 'None',
	GAMEPLAY_BASE = 'GameplayBase'
}

interface CampaignDropDownValue {
	text: string;
	value: string;
}

interface CampaignSetting {
	id: string;
	name: string;
	helpText: string;
	// default, in the case of a dropdown, refers to the INDEX of the option, NOT the value (if it is a number)
	// see the skill setting for example
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default: any;
	command: string;
	panelType: keyof PanelTagNameMap;
	dropDownValues?: Array<CampaignDropDownValue>;
}

interface CampaignPageGroup {
	[key: string]: CampaignSetting[];
}

const CAMPAIGN_SETTINGS: Record<string, CampaignSetting[]> = {
	'GameplayBase': [
		{
			id: 'cheats',
			name: 'Server Cheats',
			helpText:
				'Enable <pre>sv_cheats 1</pre> and allow the usage of commands that require it, such as <pre>noclip</pre>.\n\ndefault: false',
			default: false,
			command: 'sv_cheats',
			panelType: 'ToggleButton'
		},
		{
			id: 'mirrorWorld',
			name: 'Mirror World',
			helpText: 'Flips the world horizontally.\n\ndefault: False',
			default: false,
			command: 'cl_mirror_world',
			panelType: 'ToggleButton'
		},
		{
			id: 'gravity',
			name: 'Gravity',
			helpText: 'Adjust the world gravity.\n\ndefault: 600',
			default: 600,
			command: 'sv_gravity',
			// numberentry only supports integers
			panelType: 'TextEntry'
		},
		{
			id: 'skill',
			name: 'Difficulty',
			helpText:
				'Sets the skill level and affects how much damage is dealt/taken. Does not apply to Portal campaigns.\n\ndefault: Normal',
			default: '1',
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
			]
		}
	]
}

class CampaignSettingField {
	id: string;
	name: string;
	command: string;
	panel: GenericPanel;
	default: unknown;
	value: unknown;

	constructor (id: string, name: string, command: string, panel: GenericPanel, defaultValue: unknown) {
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

	// TODO: transmit non-default state BACK to page construction
	static constructPage() {
		const parent = $<Panel>('#SettingPageInsert');
		const page = UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_CAMPAIGN_SETTING_PAGE] as string;

		const settings = CAMPAIGN_SETTINGS[page];

		for (const setting of settings) {
			const wrapper = $.CreatePanel(
				'Panel',
				parent,
				`${setting.id}_Wrapper`,
				{ class: 'campaign-setting__entry' }
			);

			$.CreatePanel(
				'Label',
				wrapper,
				`${setting.id}_Text`,
				{
					class: 'campaign-setting__entry__text',
					text: setting.name
				}
			);

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

			const inputter = $.CreatePanel(
				setting.panelType,
				wrapper,
				`${setting.id}_Input`,
				{
					class: `campaign-setting__entry__value ${inputClassPrefix}`,
					menuclass: 'dropdown-menu'
				}
			);

			if (setting.panelType === 'DropDown') {
				if (!setting.dropDownValues) {
					$.Warning(`Campaign setting ${setting.id} is of type DropDown but does not specify any values.`);
					throw new Error(`Campaign setting ${setting.id} is of type DropDown but does not specify any values.`);
				}

				for (let i = 0; i < setting.dropDownValues.length; ++i) {
					const value = setting.dropDownValues[i];
					const o = $.CreatePanel(
						'Label', inputter, `${setting.id}${value.value}`,
						{ text: value.text, value: value.value, index: i }
					);
					(inputter as DropDown).AddOption(o);
				}
			}

			switch (setting.panelType) {
				case 'ToggleButton':
					(inputter as ToggleButton).SetSelected(setting.default);
					break;

				case 'TextEntry':
					(inputter as TextEntry).text = setting.default;
					(inputter as TextEntry).RaiseChangeEvents(true);
					break;

				case 'DropDown':
					(inputter as DropDown).SetSelectedIndex(Number(setting.default));
					break;
			
				default:
					throw new Error('This panel type is not supported as a setting widget.');
					break;
			}

			this.inputFields.push(
				new CampaignSettingField(
					setting.id,
					setting.name,
					setting.command,
					inputter,
					setting.default
				)
			);
		}

		$.RegisterForUnhandledEvent('MainMenuPagePreClose', this.onPreClose.bind(this));
	}

	static onPreClose(tab: string) {
		if (tab !== $.GetContextPanel().id) return;

		$.Msg('Collecting setting changes...');
		for (const field of this.inputFields) {
			const p = field.panel;
			switch (p.paneltype) {
				case 'ToggleButton':
					field.value = (p as ToggleButton).IsSelected();
					break;

				case 'TextEntry':
					field.value = (p as TextEntry).text;
					break;

				case 'DropDown':
					field.value = (p as DropDown).GetSelected().GetAttributeInt('index', -1);
					if (field.value === -1) throw new Error('Unable to retrieve index from DropDown Field');
					break;
			
				default:
					throw new Error('This panel type is not supported as a setting widget.');
					break;
			}

			$.Msg(`Field ${field.command} is value ${field.value}, default: ${field.default}`);
			// eslint-disable-next-line eqeqeq
			if (field.default == field.value) {
				continue;
			}
			
			$.Msg('Saving this field...');
		}
	}
}
