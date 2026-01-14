'use strict';

class MenuFeaturedBackgrounds {
	static loadingIndicator = $<Label>('#LoadingIndicator')!;
	static staticBg = $<Image>('#MainMenuBackground')!;
	static bgMapLoad: uuid | undefined = undefined;
	static loadingMap = false;
	static mapSelection = 0;
	static maps = [
		'p2ce_background_laser_intro',
		'p2ce_background_gentle_hum'
	];

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
	}

	static rerollMap() {
		this.mapSelection = Math.floor(Math.random() * this.maps.length);
		$.Msg(`Rolled background map: ${this.mapSelection}, ${this.maps[this.mapSelection]}`);
	}

	static loadBackground() {
		// TODO: check for BG Map Option
		this.rerollMap();
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
		this.loadingIndicator.visible = true;
		this.loadingMap = true;

		// set fallback
		this.staticBg.SetImage(`file://{images}/menu/featured/${this.maps[this.mapSelection]}.png`);
		MenuAnimation.showBgImg(false);

		if (this.bgMapLoad === undefined) {
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

		$.Schedule(0.25, () => {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			GameInterfaceAPI.ConsoleCommand(`map_background ${this.maps[this.mapSelection]}`);
		});
	}

	static onBackgroundMapLoaded(map: string, bgMap: boolean) {
		if (this.loadingMap) {
			this.loadingMap = false;
			MenuAnimation.switchReverse();
			MenuAnimation.hideBgImg();
			$.DispatchEvent('MainBackgroundLoaded');
		}
	}
}
