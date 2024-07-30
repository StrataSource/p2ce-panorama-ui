class PauseTab {
	static root = $.GetContextPanel();
	static panels = {
		menu: $('#menu-info')!,
		thumb: $<Image>('#chapter-thumb')!,
		chapter_title: $<Label>('#chapter-title')!,
		addon_title: $<Label>('#addon-title')!,
		addon_rating: $<AddonRatingPanel>('#addon-rating')!,
		addon_author: $<AddonAuthorPanel>('#addon-author')!,
	}

	static {
		// Update info on game pause.
		$.RegisterForUnhandledEvent('ShowPauseMenu', () => {
			this.UpdateChapterInfo();
			this.root.RemoveClass('pre-trans');
		});

		$.RegisterForUnhandledEvent('HidePauseMenu', () => {
			this.root.AddClass('pre-trans');
		});

		// Tab shown.
		$.RegisterForUnhandledEvent('MainMenu.TabSelected', (tab, data) => {
			if (tab === 'pause') this.root.RemoveClass('pre-trans');
			else this.root.AddClass('pre-trans');
		});
	}

	static UpdateChapterInfo() {
		const map = GameInterfaceAPI.GetCurrentMap();
		if (map === null) return;
		const uuid = WorkshopAPI.GetAddonByMap(map);
		if (uuid === null) return;
		
		const addon = WorkshopAPI.GetAddonMeta(uuid);
		const chapter = WorkshopAPI.GetAddonChapters(uuid).filter(x => x.map === map)[0];

		this.panels.menu.SetHasClass('active', chapter !== undefined);
		if (chapter === undefined) return;

		this.panels.thumb.SetImage(chapter.thumb);
		this.root.SetDialogVariable('addon_title', addon.title);
		this.root.SetDialogVariable('chapter_title', chapter.title);
		this.panels.addon_rating.SetAddon(uuid);
		this.panels.addon_author.SetAddon(uuid);
	}
}
