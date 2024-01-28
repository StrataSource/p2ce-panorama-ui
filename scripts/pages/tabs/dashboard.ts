
class DashboardMenu {
	static panels = {
		root:		$.GetContextPanel(),
		user_name:	$<Label>('#UserName')!,
		user_icon:	$<Panel>('#UserIcon')!,
	} as const;

	static {
		$.RegisterForUnhandledEvent('MainMenu.TabSelected', (tab) => {
			if (tab === 'dashboard') this.onDashboardShown();
			else this.onDashboardHidden();
		});
	}

	/**
	 * General onLoad initialisations.
	 * Fired when ChaosMainMenu fires its onload event.
	 */
	static onDashboardLoaded() {
		new WorkshopMenuElement($('.body')![0]);

		$.RegisterForUnhandledEvent('MainMenu.AddonFocused', (index) => {
			const addon = WorkshopAPI.GetAddonMeta(index);
			$.PlaySoundEvent('UI.Focus');
			$.Msg(`Focusing addon: ${addon.title}!`);
		});

		// @ts-expect-error We don't have types for ChaosAvatarImage yet
		this.panels.user_icon.accountid = UserAPI.GetXUID();
		this.panels.user_name.text = FriendsAPI.GetLocalPlayerName();

		$.Msg('Dashboard loaded!');
	}

	static onDashboardShown() {
		$.Msg('Dashboard shown!');
		this.panels.root.RemoveClass('pre-trans');
	}

	static onDashboardHidden() {
		$.Msg('Dashboard hidden!');
		this.panels.root.AddClass('pre-trans');
	}

	static openWorkshop() {
		$.PlaySoundEvent('UI.Click');
		SteamOverlayAPI.OpenURL('https://steamcommunity.com/app/440000/workshop/');
	}

	static openProfile() {
		$.PlaySoundEvent('UI.Click');
		SteamOverlayAPI.OpenURL('https://steamcommunity.com/my/profile/');
	}
}