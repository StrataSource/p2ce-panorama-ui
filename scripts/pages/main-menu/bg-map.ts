'use strict';

class MenuFeaturedBackgrounds {
	static bgMapLoad: uuid | undefined = undefined;
	static loadingMap = false;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
		
		this.loadBackground();
	}

	static loadBackground() {
		// TODO: check for BG Map Option

		// load up a random map from our pool
		this.loadingMap = true;
		this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
			'map_load_failed',
			(mapName: string, isBackgroundMap: boolean) => {
				if (!isBackgroundMap) return;
				$.Warning('!!!!! Could not load featured background map !!!!!');
				$.Schedule(0.001, () => {
					GameInterfaceAPI.UnregisterGameEventHandler(this.bgMapLoad!);
					this.bgMapLoad = undefined;
					MenuAnimation.switchReverse();
				});
			}
		);
		
		GameInterfaceAPI.ConsoleCommand(`map_background ${'p2ce_background_laser_intro'}`);
	}

	static onBackgroundMapLoaded(map: string, bgMap: boolean) {
		if (bgMap && this.loadingMap) {
			if (this.bgMapLoad) {
				GameInterfaceAPI.UnregisterGameEventHandler(this.bgMapLoad);
				this.bgMapLoad = undefined;
			}

			this.loadingMap = false;
			MenuAnimation.switchReverse();
		}
	}
}
