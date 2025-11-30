'use strict';

interface CampaignSetting {
	Name: string;
	HelpText: string;
	Default: unknown;
	Command: string;
}

interface CampaignPageGroup {
	[key: string]: { [key: string]: CampaignSetting };
}

const CampaignSettingHelpers: CampaignPageGroup = {
	None: {},
	GameplayBase: {
		Cheats: {
			Name: 'Server Cheats',
			HelpText:
				'Enable <pre>sv_cheats 1</pre> and allow the usage of commands that require it, such as <pre>noclip</pre>.\n\nDefault: false',
			Default: false,
			Command: 'sv_cheats'
		},
		MirrorWorld: {
			Name: 'Mirror World',
			HelpText: 'Flips the world horizontally.\n\nDefault: False',
			Default: false,
			Command: 'cl_mirror_world'
		},
		Gravity: {
			Name: 'Gravity',
			HelpText: 'Adjust the world gravity.\n\nDefault: 600',
			Default: 600,
			Command: 'sv_gravity'
		},
		Difficulty: {
			Name: 'Difficulty',
			HelpText:
				'Sets the skill level and affects how much damage is dealt/taken. Does not apply to Portal campaigns.\n\nDefault: Normal',
			Default: 1,
			Command: 'skill'
		}
	}
};

class NonDefaultDescriptor {
	panel: GenericPanel;
	name: string;
	defaultVal: string;
	actual: string = '';
	command: string;

	constructor(panel: GenericPanel, name: string, defaultVal: string, command: string) {
		this.panel = panel;
		this.name = name;
		this.defaultVal = defaultVal;
		this.command = command;
	}
}

class CampaignShared {
	static ApplyMarkup() {
		const children = $.GetContextPanel().Children();
		const helperBlock = CampaignSettingHelpers[$.GetContextPanel().GetAttributeString('settingfield', 'None')];

		for (let i = 0; i < children.length; ++i) {
			const child = children[i];
			const isSetting = child.HasClass('campaign-setting__entry');

			if (!isSetting) continue;

			child.SetHasClass('campaign-setting__entry__odd', i % 2 !== 0);

			const settingField = child.GetAttributeString('settingfield', 'None');
			const helper = helperBlock[settingField];

			child.SetPanelEvent('onmouseover', () => {
				$.DispatchEvent('CampaignSettingHovered', helper['HelpText']);
			});

			const input = child.FindChildrenWithClassTraverse('campaign-setting__entry__value')[0];

			switch (input.paneltype) {
				case 'ToggleButton':
					(input as ToggleButton).SetSelected(Boolean(helper.Default));
					break;

				case 'TextEntry':
					(input as TextEntry).text = String(helper.Default);
					break;

				case 'DropDown':
					(input as DropDown).SetSelectedIndex(Number(helper.Default));
					break;

				default:
					break;
			}
		}
	}

	static FetchPageSettings(panel: GenericPanel) {
		const children = panel.Children();
		const helperBlock = CampaignSettingHelpers[panel.GetAttributeString('settingfield', 'None')];

		const nonDefaults: NonDefaultDescriptor[] = [];

		for (let i = 0; i < children.length; ++i) {
			const child = children[i];
			const isSetting = child.HasClass('campaign-setting__entry');

			if (!isSetting) continue;

			const settingField = child.GetAttributeString('settingfield', 'None');
			const helper = helperBlock[settingField];

			const input = child.FindChildrenWithClassTraverse('campaign-setting__entry__value')[0];

			const entry = new NonDefaultDescriptor(input, helper.Name, String(helper.Default), helper.Command);

			switch (input.paneltype) {
				case 'ToggleButton':
					entry.actual = String(Number((input as ToggleButton).IsSelected()));
					break;

				case 'TextEntry':
					entry.actual = (input as TextEntry).text;
					break;

				case 'DropDown':
					entry.actual = ((input as DropDown).GetSelected() as Label).text;
					break;

				default:
					break;
			}

			// Set default field appropriately
			if (input.paneltype === 'DropDown') {
				const setIndex = (input as DropDown).GetSelected().GetAttributeInt('index', 0);
				(input as DropDown).SetSelectedIndex(Number(entry.defaultVal));
				entry.defaultVal = ((input as DropDown).GetSelected() as Label).text;
				(input as DropDown).SetSelectedIndex(setIndex);
			}

			nonDefaults.push(entry);
		}

		return nonDefaults;
	}
}
