'use strict';

class LoadingScreenController {
	static lastLoadedMapName = '';
	static logoEvent: number | undefined = undefined;
	static bgEvent: number | undefined = undefined;

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
		}

		if (this.logo) {
			if (!this.logoEvent) {
				this.logoEvent = $.RegisterEventHandler('ImageFailedLoad', this.logo, () => {
					$.Warning('Loading screen logo was specified, but cannot be found.');
					this.logo!.SetImage('file://{images}/menu/p2ce/logo.png');
				});
			}

			if (CampaignAPI.IsCampaignActive()) {
				const c = CampaignAPI.GetActiveCampaign()!;
				const img = c.meta[CampaignMeta.SQUARE_LOGO];
				if (img) {
					this.logo.SetImage(`file://${img}`);
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
				const pad = Number(campaign.meta[CampaignMeta.LOADING_LOGO_PAD]);
				if (!isNaN(pad)) {
					this.logo.style.padding = `${pad}px`;
				}
			}

			// this implicitly exists if chapter can be found
			let mapInfo: ChapterMap;

			const chapter = campaign.chapters.find((ch) => {
				const map = ch.maps.find((map) => {
					return map.name === mapName || map.name === `${mapName}.bsp`;
				});

				if (map) mapInfo = map;

				return map !== undefined;
			});

			if (!chapter) {
				$.Warning(`Chapter information for map '${mapName}' cannot be found!`);
				this.bgImage1.SetImage(getRandomFallbackImage());
				return;
			}

			// applies image and sets panel if it's valid
			// otherwise, make it invisible
			const setImg = (panel: Image, path: unknown) => {
				if (path) {
					panel.visible = true;
					panel.SetImage(`file://${path}`);
				} else {
					panel.visible = false;
				}
			};

			// finds the deepest level image:
			// map specification takes priority if it exists,
			// then chapter,
			// then campaign,
			// then warning
			const findImg = (transit: string, loading: string): unknown => {
				const asset = useTransitScreen ? transit : loading;

				let img = mapInfo.meta[asset];
				if (img) return img;

				img = chapter.meta[asset];
				if (img) return img;

				img = campaign.meta[asset];
				if (img) return img;

				$.Warning(`${asset} asset was not found.`);
				return img;
			};

			setImg(this.bgImage1, findImg(CampaignMeta.TRANSITION_SCREEN_A, CampaignMeta.LOADING_SCREEN_A));
			setImg(this.bgImage2, findImg(CampaignMeta.TRANSITION_SCREEN_B, CampaignMeta.LOADING_SCREEN_B));

			$.Schedule(0.125, this.updateLoadingScreenInfoRepeater.bind(this));
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
