
class AddonMenu {
	static panels = {
		root:	$.GetContextPanel(),
	} as const;

	static {
		$.RegisterForUnhandledEvent('MainMenu.TabSelected', (tab, data) => {
			if (tab === 'addon') this.onAddonShown(data);
			else this.onAddonHidden();
		});
	}

	static onAddonShown(uuid: uuid) {
		$<Label>('#amogus')!.text = WorkshopAPI.GetAddonMeta(uuid).title;
		$<Image>('#background')!.SetImage(WorkshopAPI.GetAddonMeta(uuid).cover);
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
