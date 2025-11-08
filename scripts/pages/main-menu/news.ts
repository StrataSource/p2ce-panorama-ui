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
	static NEWS_COUNT = 4;
	static NEWS_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440000&count=${this.NEWS_COUNT}&maxlength=280&format=json`;

	static pips = $<Panel>('#NewsPipContainer')!;
	static btn = $<Button>('#NewsBtn')!;
	static image = $<Image>('#NewsImage')!;
	static gradientImage = $<Image>('#NewsGradientImage')!;
	static header = $<Label>('#NewsHeader')!;
	static desc = $<Label>('#NewsDesc')!;

	static entries: NewsEntry[] = [];

	static {
		$.RegisterForUnhandledEvent('ShowMainMenu', this.onMainMenuOpened.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', this.onLayoutReloaded.bind(this));
	}

	static onMainMenuOpened() {
		while(this.entries.length > 0) this.entries.pop()?.panel.DeleteAsync(0);

		$.AsyncWebRequest(this.NEWS_URL, {
			type: 'GET',
			complete: this.onWebResponse.bind(this)
		});
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

			this.entries.push(new NewsEntry(i, news['title'], news['contents'], entry, () => { SteamOverlayAPI.OpenURL(news['url']) }));
		}

		$.DispatchEvent('Activated', this.entries[0].panel, PanelEventSource.MOUSE);
	}

	static setActiveNews(index: number) {
		const entry = this.entries[index];

		this.header.text = entry.header;
		this.desc.text = entry.desc;

		this.btn.SetPanelEvent('onactivate', entry.callback);
	}

	static onLayoutReloaded() {
		this.pips.RemoveAndDeleteChildren();
		this.entries = [];
		this.onMainMenuOpened();
	}
}
