function assert(x: any, message='Assertion failed!'): asserts x {
	if (!x) throw Error(message);
}

/** Describes a card used in the addons page. */
class AddonCardElement {
	element: Panel;
	cover: Image;

	constructor(parent: Panel, meta: AddonMeta) {
		this.element = $.CreatePanel('Panel', parent, '', { class: 'card pre-trans' });
		assert(this.element.LoadLayoutSnippet('card'), 'Failed to load card snippet!');
		this.cover = this.element.FindChild('cover')! as Image;

		this.cover.SetImage(meta.cover ?? 'file://{resources}/images/squirrel.jpg');
		this.element.SetDialogVariable('title', meta.title);
		this.element.SetDialogVariable('description', meta.description);
		this.element.SetDialogVariable('author', meta.authors.join(', '));

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
		assert(this.element.LoadLayoutSnippet('category'), 'Failed to load category snippet!');
		
		this.element.SetDialogVariable('title', name);

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
			addon.index = i;
			
			if (addon.local) featured.push(addon)
			else subscribed.push(addon);
		}

		this.categories.push(new CardCategoryElement(parent, 'Local', featured));
		this.categories.push(new CardCategoryElement(parent, 'Subscribed', subscribed));
	}
}
