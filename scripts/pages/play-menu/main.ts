'use strict';

class PlayMenu {
	static cardContainer = $<Panel>('#CardContainer')!;

	static onLoad() {
	}

	static displayHomeCards() {
		this.cardContainer.RemoveAndDeleteChildren();

		for (let i = 0; i < 4; ++i) {
			const card = $.CreatePanel(
				'Button',
				this.cardContainer,
				`Card${i}`
			);

			card.LoadLayoutSnippet('PlayCardSnippet');

			if (i < 3) card.AddClass('play-menu__card__spaced');
		}
	}
}
