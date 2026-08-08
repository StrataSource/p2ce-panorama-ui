'use strict';

class LoadingScreenController {
	static lastLoadedMapName = '';
	static logoEvent: number | undefined = undefined;
	static bgEvent: number | undefined = undefined;
	static bgEvent2: number | undefined = undefined;

	static progressBar = $<ProgressBar>('#ProgressBar')!;
	static progressPanel = $<Panel>('#ProgressPanel')!;
	static bgImage1 = $<Image>('#BackgroundMapImage1')!;
	static bgImage2 = $<Image>('#BackgroundMapImage2')!;
	static bgMovie = $<Movie>('#BackgroundMovie')!;
	static logo = $<Image>('#Logo')!;
	static spinner = $<Image>('#Spinner')!;
	static spinnerImage = $<AnimatedImageStrip>('#SpinnerStrip')!;
	static beBlankIfInvalid = false;

	static init() {
		$.DispatchEvent('MainMenuHideFeaturedOverlay');

		this.progressBar.value = 0;

		this.bgImage2.RemoveClass('loadingscreen__backgroundshowanim');

		if (!this.bgEvent) {
			this.bgEvent = $.RegisterEventHandler('ImageFailedLoad', this.bgImage1, () => {
				if (this.beBlankIfInvalid) {
					this.bgImage1.visible = false;
				} else {
					this.bgImage1.SetImage(getRandomFallbackImage());
				}
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
		}
	}

	static updateLoadingScreenInfoRepeater() {
		if (!this.bgImage2.visible) return;

		// Progress bar will be 1.0 when loading finishes and is then reset to 0.0
		if (this.progressBar.value >= 0.25) {
			this.bgImage2.AddClass('loadingscreen__backgroundshowanim');
			return;
		}

		// Rechecking every 8th of a second is OK, it doesn't need to be anything crazy
		$.Schedule(0.125, this.updateLoadingScreenInfoRepeater.bind(this));
	}

	static updateLoadingScreenInfo(info: LevelLoadInfo) {
		const mapName = info.mapName;
		const mapGroup = info.mapGroup;

		const useTransitScreen = this.lastLoadedMapName.length > 0;

		if (mapName.length > 0) this.lastLoadedMapName = mapName;

		const c: CampaignPair | null = CampaignAPI.FindCampaign(mapGroup);
		const meta = CampaignAPI.GetCampaignMeta(mapGroup); // SLOW

		if (c && meta) {
			// get relevant information

			// Show/Hide the panel for the progress bar.
			this.progressPanel.visible = true;
			if ((meta.get(CampaignMeta.SHOW_PROGRESS_BAR) ?? 'true').toLowerCase() === 'false') {
				this.progressPanel.visible = false;
			}

			// Show/Hide the panel that holds the spinner.
			this.spinner.visible = true;
			if ((meta.get(CampaignMeta.SHOW_SPINNER) ?? 'true').toLowerCase() === 'false') {
				this.spinner.visible = false;
			}

			// Spinner
			{
				const img = meta ? meta.get(CampaignMeta.SQUARE_LOGO) : undefined;
				if (img) {
					this.logo.SetImage(`${getCampaignAssetPath(c)}${img}`);
				} else {
					this.logo.SetImage('file://{images}/menu/p2ce/logo.png');
				}
				const spinnerImg = meta ? meta.get(CampaignMeta.SPINNER_IMAGE) : undefined;
				if (spinnerImg)
					this.spinnerImage.SetImage(`${getCampaignAssetPath(c)}${spinnerImg}`);
				else
					this.spinnerImage.SetImage('file://{images}/menu/p2ce/spinner_strip.tga');
			}

			// Logo padding
			{
				const pad = Number(meta.get(CampaignMeta.LOADING_LOGO_PAD));
				if (!isNaN(pad)) {
					this.logo.style.padding = `${pad}px`;
				}
			}

			// Get transition/loading screen movie/video to play.
			const movie = meta.get(useTransitScreen ? CampaignMeta.TRANSITION_SCREEN_MOVIE : CampaignMeta.LOADING_SCREEN_MOVIE) ?? '';
			if (movie.length > 0) {
				this.bgMovie.SetMovie(`${getCampaignAssetPath(c)}${movie}`);
				this.bgMovie.visible = true;
			} else {
				this.bgMovie.visible = false;
			}

			// applies image and sets panel if it's valid
			// otherwise, make it invisible
			const setImg = (panel: Image, path: string) => {
				if (path && path.length > 0) {
					panel.visible = true;
					panel.SetImage(`${getCampaignAssetPath(c)}${path}`);
				} else {
					panel.visible = false;
				}
			};

			let path: string;
			this.beBlankIfInvalid = isSingleWsCampaign(c);
			if (this.beBlankIfInvalid) {
				path = useTransitScreen ? 'transition_screen.png' : 'loading_screen.png';
			} else {
				path = meta.get(useTransitScreen ? CampaignMeta.TRANSITION_SCREEN : CampaignMeta.LOADING_SCREEN) ?? '';
			}

			$.Msg(`Image asset path: ${path}`);
			if (path && path.length > 0) {
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
			// No campaign, reset to default look
			this.progressPanel.visible = true;
			this.spinner.visible = true;
			this.bgImage1.visible = false;
			this.bgImage2.visible = false;
			this.bgMovie.visible = false;
			this.logo.style.padding = '0px';
			this.logo.SetImage('file://{images}/menu/p2ce/logo.png');
			this.spinnerImage.SetImage('file://{images}/menu/p2ce/spinner_strip.tga');
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
