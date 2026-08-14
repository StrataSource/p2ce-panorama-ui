/* eslint-disable camelcase */

'use strict';

class VotingMenuP2CE {
	static mapCover = $<Image>('#MapCover')!;
	static mapTitleLabel = $<Label>('#MapTitle')!;
	static authorImg = $<AvatarImage>('#MapAuthorImg')!;
	static authorLabel = $<Label>('#MapAuthorLabel')!;
	static addonId = -1;

	static onLoad() {
		// Add the blur in the background
		const p = $.CreatePanel('Panel', $.GetContextPanel(), 'MenuBackgroundLayer');
		p.SetReadyForDisplay(false);
		p.LoadLayoutSnippet('MenuBackgroundLayer');
		$.DispatchEvent('MainMenuAddBgPanel', p);
		p.FindChildTraverse('PauseMenuMainMenuBlur')!.AddClass('mainmenu__pause-blur__anim');

		// Hide menu navigation, turn off the movie, play unblur animation
		$.DispatchEvent('MainMenuHideNav', true);
		$.DispatchEvent('MainMenuHideBackgroundMovie');
		$.DispatchEvent('MainMenuSwitchFade', true, undefined);
		$.DispatchEvent('MainMenuSwitchReverse', false);

		const c = CampaignAPI.GetActiveCampaign();
		if (!c) {
			this.onQuitPressed();
			return;
		}
		// If this is an actual campaign, restart/view queue is not applicable here
		if (!c.bucket.id.startsWith('auto_')) {
			$<Button>('#RestartBtn')!.visible = $<Button>('#QueueBtn')!.visible = false;
		}

		this.addonId = c.bucket.addon_id;
		const wsMeta = WorkshopAPI.GetAddonMeta(this.addonId);

		// Set the background image to a cached preview from the workshop item
		const globalCache = UiToolkitAPI.GetGlobalObject()['UGC_DETAILS'] as Map<bigint, string[]> | undefined;
		const previews = globalCache ? (globalCache.get(wsMeta.workshopid) ?? undefined) : undefined;
		if (previews) {
			$.DispatchEvent('MainMenuShowBackgroundImage', previews[0], true);
		}

		// Fill in the author information and the background image if we didn't have a cached version
		WorkshopAPI.CreateQueryUGCDetailsRequest([wsMeta.workshopid]).then((data: Array<SteamUGCDetails_t | null>) => {
			if (data.length === 0 || data[0] === null) return;
			this.authorImg.steamid = `${data[0].ulSteamIDOwner}`;
			if (!previews) {
				$.DispatchEvent('MainMenuShowBackgroundImage', data[0].previews[0], true);
			}
		});

		// Set the text / cover
		this.mapTitleLabel.text = wsMeta.title;
		if (wsMeta.authors.length > 0) {
			this.authorLabel.text = wsMeta.authors[0];
			for (let i = 1; i < wsMeta.authors.length; ++i) {
				this.authorLabel.text += `, ${wsMeta.authors[i]}`;
			}
		} else {
			this.authorLabel.visible = false;
		}
		this.mapCover.SetImage(wsMeta.thumb);

		// Set vote if user already voted beforehand
		const rating = WorkshopAPI.GetAddonUserRating(this.addonId);
		switch (rating) {
			// ThumbsUp
			case 1:
				$<RadioButton>('#MapUpvote')!.SetSelected(true);
				break;

			// ThumbsDown
			case 2:
				$<RadioButton>('#MapDownvote')!.SetSelected(true);
				break;

			default:
				break;
		}
	}

	static setMapVote(vote: number) {
		WorkshopAPI.SetAddonUserRating(this.addonId, vote);
	}

	static onQuitPressed() {
		CampaignAPI.CompleteRating();
		GameInterfaceAPI.ConsoleCommand('disconnect');
	}

	static onRestartPressed() {
		UiToolkitAPI.ShowGenericPopupYesNo(
			$.Localize('#Action_Restart_Title'),
			$.Localize('#Action_Restart_Description'),
			'warning-popup',
			() => {
				$.DispatchEvent('MainMenuHideFeaturedOverlay');
				CampaignAPI.CompleteRating();
				GameInterfaceAPI.ConsoleCommand('restart');
			},
			() => {}
		);
	}

	static onChangeLevelPressed() {
		$.DispatchEvent(
			'MainMenuOpenNestedPage',
			'StandaloneP2CEMapViewer',
			'main-menu/play/automap-selector',
			undefined
		);
	}
}
