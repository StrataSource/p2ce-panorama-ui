/* eslint-disable camelcase */

'use strict';

type FancyListEntryBtn = {
	id: string;
	classes?: Array<string>;
	icon: string;
	tooltip?: string;
	onactivate?: () => void;
};

type FancyListEntryBtnProps = {
	enabled?: boolean;
	conditionalClasses?: Array<{cls: string, cond: boolean}>;
	addClasses?: Array<string>;
	removeClasses?: Array<string>;
	icon?: string;
	onactivate?: () => void;
};

type FancyListEntry = {
	image?: string;
	bgImage?: string;
	title: string;
	subtitle?: string;
	mini?: string;
	buttons?: Array<FancyListEntryBtn>;
	onactivate?: () => void;
};

function FancyList_CreateEntries(target: Panel, entries: Array<FancyListEntry>) {
	for (const entry of entries) {
		FancyList_CreateEntry(target, entry);
	}
}

function FancyList_CreateEntry(target: Panel, entry: FancyListEntry) {
	const p = $.CreatePanel('RadioButton', target, entry.title);
	p.LoadLayout('file://{resources}/layout/components/fancy-list-entry.xml', false, false);
	p.SetDialogVariable('title', entry.title);
	if (entry.onactivate)
		p.SetPanelEvent('onactivate', entry.onactivate);
	if (entry.subtitle)
		p.SetDialogVariable('subtitle', entry.subtitle);
	if (entry.mini)
		p.SetDialogVariable('mini', entry.mini);
	if (entry.image)
		p.FindChildTraverse<Image>('Cover')!.SetImage(entry.image);
	if (entry.bgImage)
		p.FindChildTraverse<Image>('BtnBgImg')!.SetImage(entry.bgImage);
	if (!entry.buttons)
		return;
	const controls = p.FindChildTraverse('Controls')!;
	for (let i = 0; i < entry.buttons.length; ++i) {
		const props = entry.buttons[i];
		const btn = $.CreatePanel('Button', controls, props.id);
		if (i !== entry.buttons.length - 1) {
			btn.AddClass('mr-1');
		}
		if (props.classes) {
			for (const cls of props.classes) {
				btn.AddClass(cls);
			}
		}
		$.CreatePanel('Image', btn, 'Icon', {
			class: 'button__icon',
			scaling: 'stretch-to-fit-preserve-aspect',
			src: props.icon,
			texturewidth: '64',
			textureheight: '64'
		});
		if (props.onactivate)
			btn.SetPanelEvent('onactivate', props.onactivate);
	}
}

function FancyList_ShowEntryThrobber(list: Panel, button: number, show: boolean) {
	const p = list.GetChild(button)!;
	p.FindChildTraverse('Throbber')!.SetHasClass('hide', !show);
}

function FancyList_SetEntryControlProps(list: Panel, button: number, control: number, props: FancyListEntryBtnProps) {
	const p = list.GetChild(button)!;
	const controls = p.FindChildTraverse('Controls')!;
	const btn = controls.GetChild(control)!;
	if (props.enabled !== undefined) {
		btn.enabled = props.enabled;
	}
	if (props.conditionalClasses) {
		for (const kp of props.conditionalClasses) {
			btn.SetHasClass(kp.cls, kp.cond);
		}
	}
	if (props.removeClasses) {
		for (const cls of props.removeClasses) {
			btn.RemoveClass(cls);
		}
	}
	if (props.addClasses) {
		for (const cls of props.addClasses) {
			btn.AddClass(cls);
		}
	}
	if (props.icon) {
		btn.GetChild<Image>(0)!.SetImage(props.icon);
	}
	if (props.onactivate) {
		btn.ClearPanelEvent('onactivate');
		btn.SetPanelEvent('onactivate', props.onactivate);
	}
}
