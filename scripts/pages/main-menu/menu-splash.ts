'use strict';

class MenuSplash {
    static splashPanel = $<Panel>('#SplashContainer')!;
    static menuPanel = $<Panel>('#MainContainer')!;
    static indicators = [
        $<Panel>('#SplashIndicatorLeft')!,
        $<Panel>('#SplashIndicatorRight')!
    ];
    static numPips: number;
    static currentLitPip = -1;
    static pipTimer: number;
    static splashDismissed = false;

    static {
        $.RegisterForUnhandledEvent('MapLoaded', this.onMapLoaded.bind(this));

        this.menuPanel.style.animation = 'Splash_MenuFadeIn 0s linear 0s 1 reverse forwards';
        this.numPips = this.indicators[0].Children().length;
        this.activateNextPips();

        // have to delay this so that the mainmenu doesnt eat the focus
        $.Schedule(0.001, () => { $('#SplashBtn')!.SetFocus(true) });
    }
    
    static onMapLoaded(map: string, isBackgroundMap: boolean) {
        if (!isBackgroundMap) {
            // skip splash screen
            this.onActivated(true);
        }
    }

    static activateNextPips() {
        ++this.currentLitPip;

        for (let i = 0; i < this.indicators.length; ++i) {
            const p = this.indicators[i];
            const children = p.Children();

            // deactivate last pip
            // JS appears to define modulo (%) differently,
            // in all other calculations -1 % 4 = 3, but in JS -1 % 4 = -1
            let lastPipIndex = this.currentLitPip - 1;
            if (lastPipIndex < 0) lastPipIndex = this.numPips - 1;
            const priorPip = children[lastPipIndex];
            priorPip.RemoveClass('mainmenu__splash__indicator__inactive');

            // activate next pip
            let pipToLight = this.currentLitPip;
            if (pipToLight >= this.numPips) {
                pipToLight = 0;
                this.currentLitPip = pipToLight;
            }
            const thisPip = children[pipToLight];
            thisPip.AddClass('mainmenu__splash__indicator__inactive');
        }

        this.pipTimer = $.Schedule(1, () => { this.activateNextPips() });
    }

    static onActivated(instant: boolean) {
        if (this.splashDismissed) return;

        $.CancelScheduled(this.pipTimer);
        this.splashPanel.enabled = false;

        if (!instant)
            $.PlaySoundEvent('UIPanorama.P2CE.MenuLoad');

        for (let i = 0; i < this.indicators.length; ++i) {
            const p = this.indicators[i];
            for (let j = 0; j < p.Children().length; ++j) {
                const indicator = p.Children()[j];
                indicator.RemoveClass('mainmenu__splash__indicator__inactive');
                indicator.AddClass('mainmenu__splash__indicator__active');
            }
        }

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
