'use strict';

class CampaignSelector {
	static campaignCarousel = $<Carousel>('#CampaignCarousel');

	static init() {
		if (!this.campaignCarousel) return;
		for (let i = 0; i < 16; ++i) {
			$.CreatePanel('Label', this.campaignCarousel, 'test' + i, {
				text: 'sussy ' + i,
				class: 'campaignselector__item'
			});
		}
	}
}
