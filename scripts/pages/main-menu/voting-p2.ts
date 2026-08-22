'use strict';

class VotingMenuPortal2 {
	static mapCover = $<Image>('#MapCover')!;
	static mapTitleLabel = $<Label>('#MapTitle')!;
	static authorImg = $<AvatarImage>('#MapAuthorImg')!;
	static authorLabel = $<Label>('#MapAuthorLabel')!;
	static bgImage = '';
	static mapIndex = -1;

	static onLoad() {
		const p = $.CreatePanel('Panel', $.GetContextPanel(), 'MenuBackgroundLayer');
		p.SetReadyForDisplay(false);
		p.LoadLayoutSnippet('MenuBackgroundLayer');
		$.DispatchEvent('MainMenuAddBgPanel', p);
		p.FindChildTraverse('PauseMenuMainMenuBlur')!.AddClass('mainmenu__pause-blur__anim');

		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuHideBackgroundMovie');
		$.DispatchEvent('MainMenuSwitchFade', true, undefined);
		$.DispatchEvent('MainMenuSwitchReverse', false);

		const data = Portal2WorkshopAPI.GetVotingData();
		if (data.mapIndex === -1) return;

		this.mapIndex = data.mapIndex;

		const meta = data.map.meta;

		const thumb = meta.get('thumbnail') ?? '';
		const previewsString = meta.get('previews') ?? '';
		const previews = previewsString.split(' ');

		if (previews[0].length > 0) {
			this.bgImage = previews[0];
		} else {
			this.bgImage = thumb;
		}

		$.DispatchEvent('MainMenuShowBackgroundImage', this.bgImage, false);

		this.mapTitleLabel.text = data.map.title;
		this.mapCover.SetImage(thumb);

		const owner = meta.get('owner') ?? '';
		let ownerName = FriendsAPI.GetNameForXUID(owner);
		if (ownerName.length === 0 || ownerName === '[unknown]') ownerName = meta.get('owner_name') ?? '[unknown]';
		this.authorImg.steamid = owner;
		this.authorLabel.text = ownerName;
	}

	static setMapVote(vote: number) {
		Portal2WorkshopAPI.SetItemVote(this.mapIndex, vote);
	}

	static onQuitPressed() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Return to Menu?',
			'[HC] Are you sure you want to return to the main menu?',
			'generic-popup',
			() => {
				$.DispatchEvent('MainMenuHideFeaturedOverlay');
				Portal2WorkshopAPI.VotingCompleted();
				GameInterfaceAPI.ConsoleCommand('disconnect');
			},
			() => {}
		);
	}

	static onRestartPressed() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			'[HC] Restart Test Chamber?',
			'[HC] Are you sure you want to restart the current test chamber?',
			'generic-popup',
			() => {
				$.DispatchEvent('MainMenuHideFeaturedOverlay');
				Portal2WorkshopAPI.VotingCompleted();
				GameInterfaceAPI.ConsoleCommand('restart');
			},
			() => {}
		);
	}

	static onNextLevelPressed() {}

	static onChangeLevelPressed() {
		$.DispatchEvent(
			'MainMenuOpenNestedPage',
			'StandalonePortal2MapViewer',
			'main-menu/play/p2-selector',
			undefined
		);
	}
}
