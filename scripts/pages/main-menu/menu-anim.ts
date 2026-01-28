'use strict';

class MenuAnimation {
	static movie = $<Movie>('#MainMenuMovie')!;
	static imgBg = $<Image>('#MainMenuBackground')!;
	static menuContent = $<Panel>('#MenuMainContent')!;
	static menuForeground = $<Panel>('#MenuModeForegroundLayer')!;
	static switchBlur = $<Panel>('#SwitcherBlur')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static loadingIndicator = $<Label>('#LoadingIndicator')!;

	static isBlurred = false;

	// constants
	static BACKGROUND_IMAGE_FADE_IN_TIME = 0.5;

	static init() {
		// loading indicator
		$.RegisterForUnhandledEvent('MainMenuSetLoadingIndicatorVisibility', (visible: boolean) => {
			this.loadingIndicator.visible = visible;
		});

		// blur switcher
		$.RegisterForUnhandledEvent('MainMenuSwitchFade', this.switchFade.bind(this));
		$.RegisterForUnhandledEvent('MainMenuSwitchReverse', this.switchReverse.bind(this));

		// background image
		$.RegisterForUnhandledEvent('MainMenuSetBackgroundImage', (img: string) => {
			this.imgBg.SetImage(img);
		});
		$.RegisterForUnhandledEvent('MainMenuShowBackgroundImage', this.showBgImg.bind(this));
		$.RegisterForUnhandledEvent('MainMenuHideBackgroundImage', this.hideBgImg.bind(this));
		$.RegisterEventHandler('ImageFailedLoad', this.imgBg, () => {
			this.imgBg.SetImage(getRandomFallbackImage());
		});

		// background movie
		$.RegisterForUnhandledEvent('MainMenuShowBackgroundMovie', (src: string) => {
			$.Msg(`Set movie to ${src}`);
			this.movie.SetMovie(src);
			this.movie.Play();
			this.movie.visible = true;
		});
		$.RegisterForUnhandledEvent('MainMenuHideBackgroundMovie', () => {
			this.movie.Stop();
			this.movie.visible = false;
		});

		this.movie.visible = false;
		this.loadingIndicator.visible = false;
	}

	static showBgImg(img?: string, instant?: boolean) {
		if (img) {
			this.imgBg.SetImage(img);
		}
		if (instant) {
			this.imgBg.style.animation = 'FadeOut 0.01s ease-out 0s 1 reverse forwards';
		} else {
			this.imgBg.style.animation = `FadeOut ${this.BACKGROUND_IMAGE_FADE_IN_TIME}s ease-out 0s 1 reverse forwards`;
		}
	}

	static hideBgImg(instant?: boolean) {
		if (instant) {
			this.imgBg.style.animation = 'FadeOut 0.01s linear 0s 1 normal forwards';
		} else {
			this.imgBg.style.animation = 'FadeOut 2.0s ease-out 0s 1 normal forwards';
		}
	}

	static switchFade(instantFade?: boolean, instantMenu?: boolean) {
		if (this.isBlurred) return;

		$('#MenuNav')!.enabled = false;

		this.movie = $<Movie>('#MainMenuMovie')!;
		this.movie.Stop();

		this.switchBlur.RemoveClass('anim-main-menu-switch-reverse');

		this.menuForeground.hittestchildren = false;
		this.menuForeground.enabled = false;

		if (instantMenu) {
			this.menuContent.style.animation = 'FadeOut 0.01s ease-in-out 0s 1 normal forwards';
			this.menuForeground.style.animation = 'FadeOut 0.01s ease-in-out 0s 1 normal forwards';
		} else {
			this.menuContent.style.animation = 'FadeOut 0.5s ease-in-out 0s 1 normal forwards';
			this.menuForeground.style.animation = 'FadeOut 0.5s ease-in-out 0s 1 normal forwards';
		}

		if (instantFade) {
			this.switchBlur.AddClass('anim-main-menu-blur');
		} else {
			this.switchBlur.AddClass('anim-main-menu-switch');
		}

		this.isBlurred = true;
	}

	static switchReverse() {
		this.loadingIndicator.visible = false;

		if (!this.isBlurred) return;

		$('#MenuNav')!.enabled = true;

		this.menuForeground.hittestchildren = true;
		this.menuForeground.enabled = true;

		this.menuContent.style.animation = 'FadeIn 0.5s ease-in-out 0s 1 normal forwards';
		this.menuForeground.style.animation = 'FadeIn 0.5s ease-in-out 0s 1 normal forwards';

		this.switchBlur.RemoveClass('anim-main-menu-blur');
		this.switchBlur.RemoveClass('anim-main-menu-switch');
		this.switchBlur.AddClass('anim-main-menu-switch-reverse');
		this.pageInsert.RemoveAndDeleteChildren();

		this.isBlurred = false;
	}
}
