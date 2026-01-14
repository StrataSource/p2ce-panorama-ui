'use strict';

class MenuAnimation {
	static movie = $<Movie>('#MainMenuMovie')!;
	static imgBg = $<Image>('#MainMenuBackground')!;
	static menuContent = $<Panel>('#MenuContentRoot')!;
	static switchBlur = $<Panel>('#SwitcherBlur')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static loadingIndicator = $<Label>('#LoadingIndicator')!;

	static isBlurred = false;

	// constants
	static BACKGROUND_IMAGE_FADE_IN_TIME = 0.25;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('MainMenuSwitchFade', this.switchFade.bind(this));
		this.loadingIndicator.visible = false;
	}

	static showBgImg(instant?: boolean) {
		if (instant) {
			this.imgBg.style.animation = 'FadeOut 0.01s ease-out 0s 1 reverse forwards';
		} else {
			this.imgBg.style.animation = `FadeOut ${this.BACKGROUND_IMAGE_FADE_IN_TIME}s ease-out 0s 1 reverse forwards`;
		}
	}

	static hideBgImg(instant?: boolean) {
		if (instant) {
			this.imgBg.style.animation = 'FadeOut 0.01s linear 0s 1 normal forwards';
		}
		else {
			this.imgBg.style.animation = 'FadeOut 2.0s ease-out 0s 1 normal forwards';
		}
	}

	static switchFade(instant?: boolean) {
		if (this.isBlurred) return;

		$('#MainContainer')!.enabled = false;
		
		this.movie = $<Movie>('#MainMenuMovie')!;
		this.movie.Stop();

		this.menuContent.AddClass('mainmenu__content__t-prop');
		this.menuContent.AddClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-switch-reverse');

		if (instant) this.switchBlur.AddClass('anim-main-menu-blur');
		else this.switchBlur.AddClass('anim-main-menu-switch');

		this.isBlurred = true;
	}

	static switchReverse() {
		this.loadingIndicator.visible = false;

		if (!this.isBlurred) return;

		$('#MainContainer')!.enabled = true;

		this.menuContent.RemoveClass('mainmenu__content__t-prop');
		this.menuContent.RemoveClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-blur');
		this.switchBlur.RemoveClass('anim-main-menu-switch');
		this.switchBlur.AddClass('anim-main-menu-switch-reverse');
		this.pageInsert.RemoveAndDeleteChildren();

		this.isBlurred = false;
	}
}
