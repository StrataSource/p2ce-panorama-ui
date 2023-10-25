/** Describes a card used in the addons page. */
class AddonCardElement {
	element: Panel;

	constructor(parent: Panel, meta: AddonMeta) {
		this.element = $.CreatePanel('Button', parent, '', { class: 'card' });
		this.element.CreateChildren(`
			<Image src="${meta.cover}" />
			<Panel>
				<Label class="title" text="${meta.title}" />
				<Label class="title" text="${meta.desc}" />
			</Panel>
		`);

		this.element.SetPanelEvent('onactivate', () => {
			$.DispatchEvent('Workshop.AddonClicked', meta.uuid);
			$.Msg(`Hello world from ${meta.title}!`);
		});
	}

	show() {
		this.element.AddClass('visible');
	}

	hide() {
		this.element.RemoveClass('visible');
	}
}

/** Represents a card category. */
class CardCategoryElement {
	element: Panel;
	items: AddonCardElement[];

	constructor(parent: Panel, name: string, meta: AddonMeta[]) {
		this.element = $.CreatePanel('Panel', parent, '', { class: 'category' });
		this.element.CreateChildren(`
			<Label text="${name}" />
			<Panel></Panel>
		`);

		const container = this.element.GetChild(1)!;
		this.items = new Array(meta.length);
		for (const item of meta) {
			this.items.push(new AddonCardElement(container, item));
		}
	}
}

/** Manages AddonCardElements' actions in the UI. */
class WorkshopMenuElement {
	categories: CardCategoryElement[] = [];

	constructor(parent: Panel) {
		const addonCount = WorkshopAPI.GetAddonCount();
		const addons = new Array<AddonMeta>(addonCount);
		for (let i=0; i<addonCount; i++) addons[i] = WorkshopAPI.GetAddonMeta(i);

		const category = new CardCategoryElement(parent, 'Subscribed', addons);
		this.categories.push(category);
	}
}
