'use strict';

class MenuFeaturedBackgrounds {
	static loadingIndicator = $<Label>('#LoadingIndicator')!;
	static staticBg = $<Image>('#MainMenuBackground')!;
	static bgMapLoad: uuid | undefined = undefined;
	static loadingMap = false;
	static maps = [
		'p2ce_background_laser_intro',
		'p2ce_background_gentle_hum'
	];

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
		$.DispatchEvent('MainBackgroundLoaded');
	}

	static loadLiveBg() {
		// load up a random map from our pool
		$.Msg('Loading live background...');
		this.loadingIndicator.visible = true;
		this.loadingMap = true;

		if (!this.bgMapLoad) {
			$.Msg('Live BG fail event created');
			this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
				'map_load_failed',
				(mapName: string, isBackgroundMap: boolean) => {
					if (!isBackgroundMap || !this.loadingMap) return;
					$.Warning('!!!!! Could not load featured background map !!!!!');
					$.Schedule(0.001, () => {
						this.loadingMap = false;
						MenuAnimation.switchReverse();
						$.DispatchEvent('MainBackgroundLoaded');
					});
				}
			);
		}

		GameInterfaceAPI.ConsoleCommand(`map_background ${'p2ce_background_gentle_hum'}`);
	}

	static onBackgroundMapLoaded(map: string, bgMap: boolean) {
		if (this.loadingMap) {
			this.loadingMap = false;
			MenuAnimation.switchReverse();
			$.DispatchEvent('MainBackgroundLoaded');
		}
	}
}
