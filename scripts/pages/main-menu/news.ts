'use strict';

class NewsEntry {
	index: number;
	header: string;
	desc: string;
	panel: RadioButton;
	callback: () => void;

	constructor(index: number, header: string, desc: string, panel: RadioButton, callback: () => void) {
		this.index = index;
		this.header = header;
		this.desc = desc;
		this.panel = panel;
		this.callback = callback;
	}
}

class NewsReel {
	static NEWS_COUNT = 5;
	static NEWS_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440000&count=${this.NEWS_COUNT}&maxlength=280&format=json`;

	static pips = $<Panel>('#NewsPipContainer')!;
	static btn = $<Button>('#NewsBtn')!;
	static image = $<Image>('#NewsImage')!;
	static gradientImage = $<Image>('#NewsGradientImage')!;
	static header = $<Label>('#NewsHeader')!;
	static desc = $<Label>('#NewsDesc')!;
	static timeBar = $<Panel>('#NewsProgressBar')!;
	static container = $<Panel>('#News')!;

	static entries: NewsEntry[] = [];
	static selectedEntry: number = 0;

	static {
		$.RegisterForUnhandledEvent('ShowMainMenu', this.onMainMenuOpened.bind(this));
		$.RegisterForUnhandledEvent('HideMainMenu', this.onMainMenuClosed.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', this.onLayoutReloaded.bind(this));
		$.RegisterEventHandler('PropertyTransitionEnd', this.timeBar, this.onAutoAdvanceTimeElapsed.bind(this));
		$.RegisterForUnhandledEvent('ShowContentPanel', this.onHomeNavAway.bind(this));
		$.RegisterForUnhandledEvent('HideContentPanel', this.onHomeNavTo.bind(this));
	}

	static onMainMenuOpened() {
		while(this.entries.length > 0) this.entries.pop()?.panel.DeleteAsync(0);

		this.container.visible = false;

		$.AsyncWebRequest(this.NEWS_URL, {
			type: 'GET',
			complete: this.onWebResponse.bind(this)
		});
	}

	static onMainMenuClosed() {
		this.stopAutoAdvanceAnim();
	}

	static onWebResponse(data) {
		if (data.statusText !== 'success') {
			$.Warning('Failed to retrieve news!');
			return;
		}

		// using the responseText on its own results in a parsing error
		// might be some invisible terminating character or something
		const response = JSON.parse(data.responseText.substring(0, data.responseText.length - 1));
		const allNews = response['appnews']['newsitems'];

		for (let i = 0; i < this.NEWS_COUNT; ++i) {
			const news = allNews[i];
			const entry = $.CreatePanel('RadioButton', this.pips, `newsPip${i}`);
			entry.LoadLayoutSnippet('NewsPipSnippet');

			entry.SetPanelEvent('onactivate', () => { this.setActiveNews(i) });
			entry.SetPanelEvent('onmouseover', () => { UiToolkitAPI.ShowTextTooltip(`newsPip${i}`, news['title']) });
			entry.SetPanelEvent('onmouseout', () => { UiToolkitAPI.HideTextTooltip() });

			this.entries.push(new NewsEntry(i, news['title'], news['contents'], entry, () => { SteamOverlayAPI.OpenURL(news['url']) }));
		}

		this.container.visible = true;
		$.DispatchEvent('Activated', this.entries[0].panel, PanelEventSource.MOUSE);
	}

	static startAutoAdvanceAnim() {
		if (this.entries.length > 0) {
			this.timeBar.AddClass('home__news__content__progress__activate-transition');
			this.timeBar.AddClass('home__news__content__progress__animate');
		}
	}

	static stopAutoAdvanceAnim() {
		if (this.timeBar.HasClass('home__news__content__progress__activate-transition')) {
			this.timeBar.RemoveClass('home__news__content__progress__activate-transition');
			this.timeBar.RemoveClass('home__news__content__progress__animate');
		}
	}

	static setActiveNews(index: number) {
		if (index >= this.entries.length) return;

		this.stopAutoAdvanceAnim();

		const entry = this.entries[index];

		this.selectedEntry = index;

		this.header.text = entry.header;
		this.desc.text = entry.desc;

		this.btn.SetPanelEvent('onactivate', entry.callback);

		this.startAutoAdvanceAnim();
	}

	// using animated properties because i want it to be SMOOOOOOOOOOOOOOOTH
	static onAutoAdvanceTimeElapsed(panel: string, prop: string) {
		if (prop === 'width' && this.timeBar.HasClass('home__news__content__progress__activate-transition')) {
			this.stopAutoAdvanceAnim();
			
			this.selectedEntry += 1;
			if (this.selectedEntry >= this.entries.length) this.selectedEntry = 0;
			$.DispatchEvent('Activated', this.entries[this.selectedEntry].panel, PanelEventSource.MOUSE);
		}
	}

	static onReelMouseOver() {
		this.stopAutoAdvanceAnim();
	}

	static onReelMouseOut() {
		this.startAutoAdvanceAnim();
	}

	static onHomeNavAway() {
		this.stopAutoAdvanceAnim();
	}

	static onHomeNavTo() {
		this.startAutoAdvanceAnim();
	}

	static onLayoutReloaded() {
		this.pips.RemoveAndDeleteChildren();
		this.entries = [];
		this.onMainMenuOpened();
	}
}
