interface AddonRatingPanel extends Panel {
	SetAddon(addon: uuid): void;
}

class AddonRating {
	static root = $.GetContextPanel() as AddonRatingPanel;
	static up = $<Image>('#thumbs-up')!;
	static down = $<Image>('#thumbs-down')!;

	static {
		this.root.SetAddon = this.SetAddon.bind(this);
	}

	static SetAddon(id: uuid) {
		const addon = WorkshopAPI.GetAddonMeta(id);
	}

	static SetRating(rating: boolean|null) {
		this.up.SetHasClass('active', rating === true);
		this.down.SetHasClass('active', rating === false);
	}
}
