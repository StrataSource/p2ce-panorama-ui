'use strict';

class MenuSplash {
    static splashPanel = $<Panel>('#SplashContainer')!;
    static menuPanel = $<Panel>('#MainContainer')!;
    static splashDismissed = false;

    static {
        $.RegisterForUnhandledEvent('MapLoaded', this.onMapLoaded.bind(this));

        this.menuPanel.style.animation = 'Splash_MenuFadeIn 0s linear 0s 1 reverse forwards';

        // have to delay this so that the mainmenu doesnt eat the focus
        //$.Schedule(0.001, () => { $('#SplashBtn')!.SetFocus(true) });

        this.onActivated(true);
    }
    
    static onMapLoaded(map: string, isBackgroundMap: boolean) {
        if (!isBackgroundMap) {
            // skip splash screen
            this.onActivated(true);
        }
    }

    static onActivated(instant: boolean) {
        if (this.splashDismissed) return;

        this.splashPanel.enabled = false;

        if (!instant)
            $.PlaySoundEvent('UIPanorama.P2CE.MenuLoad');

        this.splashPanel.style.animation = `Splash_SplashFadeOut ${instant ? 0.001 : 1}s ease-out 0s 1 normal forwards`;
        $.Schedule(instant ? 0 : 0.5, () => {
            this.menuPanel.style.animation = `Splash_MenuFadeIn ${instant ? 0.001 : 1}s ease-out 0s 1 normal forwards`;
            $.Schedule(instant ? 0 : 0.5, () => {
                this.menuPanel.enabled = true;
                MainMenu.onMainMenuFocused();
            });
        });

        this.splashDismissed = true;
    }
};
