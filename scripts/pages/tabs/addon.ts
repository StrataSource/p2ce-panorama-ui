
class AddonMenu {
	static panels = {
		root:	$.GetContextPanel(),
		bg:		$<Image>('#background')!,
		list:	$<Panel>('#addon-chapters')!,
		title:	$<Label>('#chapter-title')!,
		desc:	$<Label>('#chapter-description')!,
	} as const;

	static {
		$.RegisterForUnhandledEvent('MainMenu.TabSelected', (tab, data) => {
			if (tab === 'addon') this.onAddonShown(data);
			else this.onAddonHidden();
		});
	}

	static onAddonShown(uuid: uuid) {
		const addon = WorkshopAPI.GetAddonMeta(uuid);
		this.panels.bg.SetImage(addon.cover);
		this.panels.title.text = addon.title;
		this.panels.desc.text = addon.description;
		this.panels.list.RemoveAndDeleteChildren();
		const chapters = WorkshopAPI.GetAddonMaps(uuid);
		for (const chapter of chapters) {
			const el_chapter = $.CreatePanel('Panel', this.panels.list, '');
			const el_thumb = $.CreatePanel('Image', el_chapter, '', { src: chapter.thumb });
			const el_title = $.CreatePanel('Label', el_chapter, '', { text: chapter.title });
		}

		this.panels.root.RemoveClass('pre-trans');
	}

	static onAddonHidden() {
		this.panels.root.AddClass('pre-trans');
	}

	static goBack() {
		$.PlaySoundEvent('UI.Unclick');
		$.DispatchEvent('MainMenu.AddonUnfocused');
	}
}
