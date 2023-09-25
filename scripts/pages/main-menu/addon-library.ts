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
			$.Msg(`Hello world from ${meta.title}!`);
		});
	}
}

/** Manages AddonCardElements' actions in the UI. */
class CardLibraryElement {

}
