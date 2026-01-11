'use strict';

class MenuFeaturedBackgrounds {
	static loadingIndicator = $<Label>('#LoadingIndicator')!;
	static staticBg = $<Image>('#MainMenuBackground')!;
	static bgMapLoad: uuid | undefined = undefined;
	static loadingMap = false;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
		
		this.loadBackground();
	}

	static loadBackground() {
		// TODO: check for BG Map Option
		// eslint-disable-next-line no-constant-condition
		if (false) {
			this.loadStaticBg();
		} else {
			this.loadLiveBg();
		}
	}

	static loadStaticBg() {
		this.staticBg.SetImage('file://{images}/menu/featured/microcomp_dark_mikatastrophe.png');
		MenuAnimation.showBgImg(true);
		MenuAnimation.switchReverse();
	}

	static loadLiveBg() {
		// load up a random map from our pool
		this.loadingIndicator.visible = true;
		this.loadingMap = true;
		this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
			'map_load_failed',
			(mapName: string, isBackgroundMap: boolean) => {
				if (!isBackgroundMap) return;
				$.Warning('!!!!! Could not load featured background map !!!!!');
				$.Schedule(0.001, () => {
					if (this.bgMapLoad) {
						GameInterfaceAPI.UnregisterGameEventHandler(this.bgMapLoad!);
						this.bgMapLoad = undefined;
					}
					this.loadingMap = false;
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
