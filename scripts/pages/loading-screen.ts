
GameInterfaceAPI.GetCurrentMap ??= function() {
	return 'sp_a1_intro1';
}

class LoadingScreen {
	static root = $.GetContextPanel();
	static panels = {
		container: $('#container')!,
		background: $<Image>('#background')!,
	}

	static {
		$.RegisterForUnhandledEvent('UnloadLoadingScreenAndReinit', this.init.bind(this));
	}

	static init() {
		const map = GameInterfaceAPI.GetCurrentMap()!;
		const addon = WorkshopAPI.GetAddonByMap(map);
		let chapter: AddonChapterMeta|null = null;

		if (addon !== null) {
			const chapters = WorkshopAPI.GetAddonChapters(addon);
			for (const c of chapters) {
				if (c.map !== map) continue;
				chapter = c;
				break;
			}
		}

		if (chapter !== null) {
			$.Msg('Setting loading screen background to '+chapter.background);
			this.panels.background.AddClass('active');
			this.panels.background.SetImage(chapter.background);
		}
		else {
			this.panels.background.RemoveClass('active');
		}
	}
}
