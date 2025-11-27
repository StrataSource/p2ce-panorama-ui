'use strict';

class PlayMenu {
	// shows the player count selection page
	static onPlayBtnPressed(type: string) {
		$.DispatchEvent(
			'MainMenuOpenNestedPage',
			'[HC] Select Player Count',
			'[HC] Are you playing alone or playing multiplayer?',
			'play-menu/player-mode',
			'play-type',
			type
		);
	}

	// shows the loose map type page
	static onSoloMapsBtnPressed() {
		$.DispatchEvent(
			'MainMenuOpenNestedPage',
			'[HC] Select Community Map Pool',
			'[HC] Would you like to play P2:CE or Portal 2 Workshop maps?',
			'play-menu/solo-map-mode',
			'', undefined
		);
	}
	
	// shows the campaign lister page with the correct filters as specified
	static onPlayerBtnPressed(isSingleplayer: boolean = false) {
		const playType = $.persistentStorage.getItem('ui-payload.play-type');

		if (playType) {
			const playerCount = isSingleplayer ? 'singleplayer' : 'multiplayer';

			// TODO: This needs to be localized and also made to not be ass.
			const headerInterject = isSingleplayer ? 'Singleplayer' : 'Multiplayer';

			// campaign
			if (playType === 'campaigns') {
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					`[HC] Play ${headerInterject} Campaign`,
					'[HC] Select a campaign to play',
					'main-menu/campaigns',
					'player-count',
					playerCount
				);
			// p2ce solo map
			} else if (playType === 'p2ce') {
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					`[HC] Play P2:CE ${headerInterject} Workshop Map`,
					'[HC] Select a community map to play',
					'main-menu/campaigns',
					'player-count',
					playerCount
				);
			} else {
				// p2 workshop map
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					`[HC] Play Portal 2 ${headerInterject} Workshop Map`,
					'[HC] Select a community map to play',
					'main-menu/campaigns',
					'player-count',
					playerCount
				);
			}
		}
	}
}
