'use strict';

class LoadingScreen {
	static panels = {
		/** @type {Panel} @static */
		cp: $.GetContextPanel(),
		/** @type {Image} @static */
		backgroundImage: $('#BackgroundImage'),
		/** @type {ProgressBar} @static */
		progressBar: $('#ProgressBar'),
		/** @type {Label} @static */
		mapName: $('#MapName'),
		/** @type {Label} @static */
		author: $('#Author'),
		/** @type {Label} @static */
		tierAndType: $('#TierAndType'),
		/** @type {Label} @static */
		numZones: $('#NumZones')
	};

	static {
		$.RegisterForUnhandledEvent('UnloadLoadingScreenAndReinit', this.init.bind(this));

		$.RegisterEventHandler(
			'PanelLoaded',
			this.panels.backgroundImage,
			() => (this.panels.backgroundImage.visible = true)
		);
		$.RegisterEventHandler(
			'ImageFailedLoad',
			this.panels.backgroundImage,
			() => (this.panels.backgroundImage.visible = false)
		);
	}

	static init() {
		this.panels.progressBar.value = 0;

		
		this.panels.cp.SetDialogVariable('tip', 'aaa_loading_tip_aaa');

		this.panels.mapName.visible = false;
		this.panels.author.visible = false;
		this.panels.tierAndType.visible = false;
		this.panels.numZones.visible = false;
		this.panels.backgroundImage.visible = false;
	}

}
