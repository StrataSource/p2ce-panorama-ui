'use strict';

class MenuFeaturedBackgrounds {
    static loadingIndicator = $<Label>('#LoadingIndicator')!;

    static loadingMap = false;

    static onMainMenuLoaded() {
        $.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));
        
        this.loadBackground();
    }

    static loadBackground() {

        // TODO: check for BG Map Option

        // load up a random map from our pool
        this.loadingMap = true;
        GameInterfaceAPI.ConsoleCommand(`map_background ${'p2ce_background_laser_intro'}`);
    }

    static onBackgroundMapLoaded(map: string, bgMap: boolean) {
        if (bgMap && this.loadingMap) {
            this.loadingMap = false;

            this.hideBlur();
        }
    }

    static hideBlur() {
        MainMenuCampaignMode.switchReverse();
        this.loadingIndicator.visible = false;
    }
}
