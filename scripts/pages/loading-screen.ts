'use strict';

class LoadingScreenController {
	static lastLoadedMapName = '';
	static logoEvent: number | undefined = undefined;
	static bgEvent: number | undefined = undefined;
	static bgEvent2: number | undefined = undefined;

	static progressBar = $('#ProgressBar') as ProgressBar;
	static bgImage1 = $('#BackgroundMapImage1') as Image;
	static bgImage2 = $('#BackgroundMapImage2') as Image;
	static logo = $<Image>('#Logo');

	static init() {
		this.progressBar.value = 0;

		this.bgImage1.RemoveClass('loadingscreen__backgroundhideanim');

		if (!this.bgEvent) {
			this.bgEvent = $.RegisterEventHandler('ImageFailedLoad', this.bgImage1, () => {
				this.bgImage1.SetImage(getRandomFallbackImage());
			});
			this.bgEvent2 = $.RegisterEventHandler('ImageFailedLoad', this.bgImage1, () => {
				this.bgImage2.visible = false;
			});
		}

		if (this.logo) {
			if (!this.logoEvent) {
				this.logoEvent = $.RegisterEventHandler('ImageFailedLoad', this.logo, () => {
					$.Warning('LOADING SCREEN: Square logo was specified, but could not be loaded.');
					this.logo!.SetImage('file://{images}/menu/p2ce/logo.png');
				});
			}

			if (CampaignAPI.IsCampaignActive()) {
				const c = CampaignAPI.GetActiveCampaign()!;
				const img = CampaignAPI.GetCampaignMeta(null).get(CampaignMeta.SQUARE_LOGO);
				if (img) {
					this.logo.SetImage(`${getCampaignAssetPath(c)}${img}`);
				} else {
					this.logo.SetImage('file://{images}/menu/p2ce/logo.png');
				}
			} else {
				this.logo.SetImage('file://{images}/menu/p2ce/logo.png');
			}
		}
	}

	static updateLoadingScreenInfoRepeater() {
		if (!this.bgImage2.visible) return;

		// Progress bar will be 1.0 when loading finishes and is then reset to 0.0
		if (this.progressBar.value >= 0.25) {
			this.bgImage1.AddClass('loadingscreen__backgroundhideanim');
			return;
		}

		// Rechecking every 8th of a second is OK, it doesn't need to be anything crazy
		$.Schedule(0.125, this.updateLoadingScreenInfoRepeater.bind(this));
	}

	static updateLoadingScreenInfo(mapName: string) {
		const useTransitScreen = this.lastLoadedMapName.length > 0;

		if (mapName.length > 0) this.lastLoadedMapName = mapName;

		if (CampaignAPI.IsCampaignActive()) {
			// get relevant information
			const campaign = CampaignAPI.GetActiveCampaign()!;

			if (this.logo) {
				const pad = Number(CampaignAPI.GetCampaignMeta(null).get(CampaignMeta.LOADING_LOGO_PAD));
				if (!isNaN(pad)) {
					$.Msg(`LOADING SCREEN: Set logo padding to ${pad}px`);
					this.logo.style.padding = `${pad}px`;
				}
			}

			// applies image and sets panel if it's valid
			// otherwise, make it invisible
			const setImg = (panel: Image, path: unknown) => {
				if (path) {
					panel.visible = true;
					panel.SetImage(`${getCampaignAssetPath(campaign)}${path}`);
				} else {
					panel.visible = false;
				}
			};

			const findImg = (transit: string, loading: string): unknown => {
				const asset = useTransitScreen ? transit : loading;
				return CampaignAPI.GetCampaignMeta(null).get(asset);
			};

			const path = findImg(CampaignMeta.TRANSITION_SCREEN, CampaignMeta.LOADING_SCREEN);
			if (path) {
				const split = (path as string).split('.');
				let join = '';
				for (let i = 0; i < split.length - 1; ++i) {
					join += split[i];
				}
				setImg(this.bgImage1, join + '_1.' + split[split.length - 1]);
				setImg(this.bgImage2, join + '_2.' + split[split.length - 1]);

				$.Schedule(0.125, this.updateLoadingScreenInfoRepeater.bind(this));
			} else {
				this.bgImage1.visible = false;
				this.bgImage2.visible = false;
			}
		} else {
			this.bgImage1.visible = false;
			this.bgImage2.visible = false;
		}
	}

	static {
		$.RegisterForUnhandledEvent('UnloadLoadingScreenAndReinit', this.init.bind(this));
		$.RegisterForUnhandledEvent('PopulateLoadingScreen', this.updateLoadingScreenInfo.bind(this));
		$.RegisterForUnhandledEvent('LoadingScreenClearLastMap', () => {
			this.lastLoadedMapName = '';
		});
	}
}
