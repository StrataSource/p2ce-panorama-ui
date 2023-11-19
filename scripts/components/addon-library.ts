/** Describes a card used in the addons page. */
class AddonCardElement {
	element: Panel;

	constructor(parent: Panel, meta: AddonMeta) {
		this.element = $.CreatePanel('Panel', parent, '', { class: 'card pre-trans' });
		this.element.CreateChildren(`
			<Image class="cover" src="${meta.cover}" scaling="stretch-to-cover-preserve-aspect" />
			<Panel>
				<Label class="title" text="${meta.title}" />
				<Label class="author" text="${meta.authors[0]}" />
				<Label class="description" text="${meta.description}" />
			</Panel>
		`);

		this.element.SetPanelEvent('onactivate', () => {
			$.DispatchEvent('MainMenu.AddonFocused', meta.index);
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

	constructor(parent: Panel, name: string, addons: AddonMeta[], delay: number=0) {
		this.element = $.CreatePanel('Panel', parent, '', { class: 'category' });
		this.element.CreateChildren(`
			<Panel class="title"><Label text="${name}" /></Panel>
			<Panel class="content"></Panel>
		`);

		const container = this.element.GetLastChild()!;
		this.items = new Array(addons.length);
		for (let i=0; i<addons.length; i++) {
			const card = new AddonCardElement(container, addons[i]);
			this.items[i] = card;

			// Fade tiles in one-by-one on first load.
			$.Schedule(i/20 + delay, () => card.element.RemoveClass('pre-trans'))
		}
	}
}

/** Manages AddonCardElements' actions in the UI. */
class WorkshopMenuElement {
	categories: CardCategoryElement[] = [];

	constructor(parent: Panel) {
		const addonCount = WorkshopAPI.GetAddonCount();

		const featured: AddonMeta[] = [];
		const subscribed: AddonMeta[] = [];

		for (let i=0; i<addonCount; i++) {
			const addon = WorkshopAPI.GetAddonMeta(i);
			if (addon.local) featured.push(addon)
			else subscribed.push(addon);
		}

		this.categories.push(new CardCategoryElement(parent, 'Local', featured));
		this.categories.push(new CardCategoryElement(parent, 'Subscribed', subscribed));
	}
}
