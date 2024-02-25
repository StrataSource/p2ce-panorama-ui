
class AddonMenu {
	static panels = {
		root:	$.GetContextPanel(),
		bg:		$<Image>('#background')!,
		list:	$<Panel>('#addon-chapters')!,
		title:	$<Label>('#chapter-title')!,
		desc:	$<Label>('#chapter-description')!,
	} as const;

	static addon?: AddonMeta;
	static chapter: number = 0;

	static {
		$.RegisterForUnhandledEvent('MainMenu.TabSelected', (tab, data) => {
			if (tab === 'addon') this.onAddonShown(data);
			else this.onAddonHidden();
		});
	}

	static onAddonShown(uuid: uuid) {
		const addon = WorkshopAPI.GetAddonMeta(uuid);
		this.addon = addon;
		this.panels.list.RemoveAndDeleteChildren();
		const chapters = WorkshopAPI.GetAddonChapters(uuid);
		for (let i=0; i<chapters.length; i++) {
			const chapter = chapters[i];
			const el_chapter = $.CreatePanel('Button', this.panels.list, '');
			el_chapter.SetPanelEvent('onactivate', () => AddonMenu.selectChapter(i));
			$.CreatePanel('Image', el_chapter, '', { src: chapter.thumb, scaling: 'stretch-to-cover-preserve-aspect' });
			$.CreatePanel('Label', el_chapter, '', { text: chapter.title });
		}

		this.panels.root.RemoveClass('pre-trans');
		this.selectChapter(0);
	}

	static selectChapter(n: number) {
		if (n !== this.chapter) $.PlaySoundEvent('UI.Click');
		this.panels.list.GetChild(this.chapter)!.RemoveClass('active');
		this.panels.list.GetChild((this.chapter = n))!.AddClass('active');
		this.chapter = n;
		const chapter = WorkshopAPI.GetAddonChapters(this.addon!.index)[n];

		this.panels.title.text = chapter.title;
		this.panels.desc.text = chapter.description;
		this.panels.bg.SetImage(chapter.background);
	}

	static playChapter() {
		const chapter = WorkshopAPI.GetAddonChapters(this.addon!.index)[this.chapter];
		const map = chapter.map.replace(/[;"'\n\r\0]/g, '_');
		GameInterfaceAPI.ConsoleCommand(`map "${map}"`);
	}

	static onAddonHidden() {
		this.panels.root.AddClass('pre-trans');
	}

	static goBack() {
		$.PlaySoundEvent('UI.Unclick');
		$.DispatchEvent('MainMenu.AddonUnfocused');
	}
}
