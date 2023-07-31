class LoadingScreen {
	static panels = {
		cp: $.GetContextPanel(),
		backgroundImage: $<Image>('#BackgroundImage')!,
		progressBar: $<ProgressBar>('#ProgressBar')!,
		mapName: $<Label>('#MapName')!,
		author: $<Label>('#Author')!,
		tierAndType: $<Label>('#TierAndType')!,
		numZones: $<Label>('#NumZones')!
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
		this.panels.mapName.visible = false;
		this.panels.author.visible = false;
		this.panels.tierAndType.visible = false;
		this.panels.numZones.visible = false;
		this.panels.backgroundImage.visible = false;
	}
}
