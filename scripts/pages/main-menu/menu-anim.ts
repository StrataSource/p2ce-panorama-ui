'use strict';

class MenuAnimation {
	static movie = $<Movie>('#MainMenuMovie')!;
	static menuContent = $<Panel>('#MenuContentRoot')!;
	static switchBlur = $<Panel>('#SwitcherBlur')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static loadingIndicator = $<Label>('#LoadingIndicator')!;

	static isBlurred = false;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('MainMenuSwitchFade', this.switchFade.bind(this));
		this.loadingIndicator.visible = false;
	}

	static switchFade() {
		this.movie = $<Movie>('#MainMenuMovie')!;
		this.movie.Stop();

		this.menuContent.AddClass('mainmenu__content__t-prop');
		this.menuContent.AddClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-switch-reverse');
		this.switchBlur.AddClass('anim-main-menu-switch');

		this.isBlurred = true;
	}

	static switchReverse() {
		if (!this.isBlurred) return;

		this.menuContent.RemoveClass('mainmenu__content__t-prop');
		this.menuContent.RemoveClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-switch');
		this.switchBlur.AddClass('anim-main-menu-switch-reverse');
		this.pageInsert.RemoveAndDeleteChildren();

		this.isBlurred = false;
		this.loadingIndicator.visible = false;
	}
}
