interface AddonAuthorPanel extends Panel {
	SetAddon(addon: uuid): void;
}

class AddonAuthor {
	static root = $.GetContextPanel() as AddonAuthorPanel;
	static icon = $<AvatarImage>('#icon')!;

	static {
		this.root.SetAddon = this.SetAddon.bind(this);
	}

	static SetAddon(id: uuid) {
		const addon = WorkshopAPI.GetAddonMeta(id);
		const author = addon.authors[0];
		if (!author) return;

		const username = 'UberPortalX LABS'; // NO APIS EXIST FOR THIS
		const nickname = 'Jon Uberportal'; // NO APIS EXIST FOR THIS

		this.icon.accountid = author;
		this.root.SetDialogVariable('author_username', username);
		this.root.SetDialogVariable('author_nickname', nickname);
	}
}
