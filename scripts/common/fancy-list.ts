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
	title: { text: string, hasVars?: boolean };
	subtitle?: { text: string, hasVars?: boolean };
	mini?: { text: string, hasVars?: boolean };
	// may only show one of each
	genericIndicator?: { text: string, show: boolean };
	badIndicator?: { text: string, show: boolean };
	buttons?: Array<FancyListEntryBtn>;
	onactivate?: () => void;
};

type FancyListEntryProps = {
	genericIndicator?: { text?: string, show?: boolean };
	badIndicator?: { text?: string, show?: boolean };
};

function FancyList_CreateEntries(target: Panel, entries: Array<FancyListEntry>) {
	for (const entry of entries) {
		FancyList_CreateEntry(target, entry);
	}
}

function FancyList_CreateEntry(target: Panel, entry: FancyListEntry) {
	const p = $.CreatePanel('RadioButton', target, entry.title.text);
	p.LoadLayout('file://{resources}/layout/components/fancy-list-entry.xml', false, false);
	if (entry.title.hasVars) {
		const title = p.FindChildTraverse<Label>('Title')!;
		title.SetTextWithDialogVariables(entry.title.text);
	} else {
		p.SetDialogVariable('title', entry.title.text);
	}
	if (entry.subtitle !== undefined)
	{
		if (entry.subtitle.hasVars) {
			const subtitle = p.FindChildTraverse<Label>('Subtitle')!;
			subtitle.SetTextWithDialogVariables(entry.subtitle.text);
		} else {
			p.SetDialogVariable('subtitle', entry.subtitle.text);
		}
	}
	else
	{
		p.FindChildTraverse('Subtitle')!.AddClass('hide');
	}
	if (entry.mini !== undefined)
	{
		if (entry.mini.hasVars) {
			const mini = p.FindChildTraverse<Label>('Mini')!;
			mini.SetTextWithDialogVariables(entry.mini.text);
		} else {
			p.SetDialogVariable('mini', entry.mini.text);
		}
	}
	else
	{
		p.FindChildTraverse('Mini')!.AddClass('hide');
	}
	if (entry.onactivate)
		p.SetPanelEvent('onactivate', entry.onactivate);
	{
		const img = p.FindChildTraverse<Image>('Cover')!;
		installImageFallbackHandler(img);
		p.FindChildTraverse<Image>('Cover')!.SetImage(entry.image ?? getRandomFallbackImage());
	}
	{
		const img = p.FindChildTraverse<Image>('BtnBgImg')!;
		installImageFallbackHandler(img);
		if (entry.bgImage)
			img.SetImage(entry.bgImage);
	}
	if (!entry.buttons)
		return p;
	if (entry.badIndicator) {
		const indP = p.FindChildTraverse('BadIndicator')!;
		indP.SetHasClass('hide', !entry.badIndicator.show);
		indP.GetChild<Label>(0)!.text = entry.badIndicator.text;
	}
	if (entry.genericIndicator) {
		const indP = p.FindChildTraverse('GenericIndicator')!;
		indP.SetHasClass('hide', !entry.genericIndicator.show);
		indP.GetChild<Label>(0)!.text = entry.genericIndicator.text;
	}
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
			texturewidth: '96',
			textureheight: '96'
		});
		if (props.onactivate)
			btn.SetPanelEvent('onactivate', props.onactivate);
	}
	return p;
}

function FancyList_ShowEntryThrobber(list: Panel, button: number, show: boolean) {
	const p = list.GetChild(button)!;
	p.FindChildTraverse('Throbber')!.SetHasClass('hide', !show);
}

function FancyList_SetEntryProps(list: Panel, button: number, props: FancyListEntryProps) {
	const p = list.GetChild(button)!;
	if (props.badIndicator) {
		const indP = p.FindChildTraverse('BadIndicator')!;
		if (props.badIndicator.show !== undefined)
			indP.SetHasClass('hide', !props.badIndicator.show);
		if (props.badIndicator.text)
			indP.GetChild<Label>(0)!.text = props.badIndicator.text;
	}
	if (props.genericIndicator) {
		const indP = p.FindChildTraverse('GenericIndicator')!;
		if (props.genericIndicator.show !== undefined)
			indP.SetHasClass('hide', !props.genericIndicator.show);
		if (props.genericIndicator.text)
			indP.GetChild<Label>(0)!.text = props.genericIndicator.text;
	}
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
