'use strict';

class MainMenuCampaignMode {
	static movie = $<Movie>('#MainMenuMovie')!;

	static logo = $<Image>('#GameFullLogo')!;
	static campaignDevTxt = $<Label>('#DevCampaign')!;
	static menuContent = $<Panel>('#MenuContentRoot')!;
	static switchBlur = $<Panel>('#SwitcherBlur')!;
	static pageInsert = $<Panel>('#PageInsert')!;
	static imgBg = $<Image>('#MainMenuBackground')!;
	static loadingIndicator = $<Label>('#LoadingIndicator')!;

	static selectedCampaign: CampaignInfo;

	static continueBtn = $<Button>('#CampaignContinueBtn')!;
	static continueText = $<Label>('#ContinueCampaignText')!;
	static continueImg = $<Image>('#ContinueSaveThumb')!;
	static continueLogo = $<Image>('#ContinueSaveLogo')!;
	static continueHeadline = $<Label>('#ContinueSaveHeadline')!;
	static continueTagline = $<Label>('#ContinueSaveTagline')!;

	static latestSave: GameSave;

	static isBlurred = false;

	static onMainMenuLoaded() {
		$.RegisterForUnhandledEvent('SetActiveUiCampaign', this.onCampaignSelected.bind(this));
		$.RegisterForUnhandledEvent('MainMenuSwitchFade', this.switchFade.bind(this));
		$.RegisterForUnhandledEvent('MapLoaded', this.onBackgroundMapLoaded.bind(this));

		this.loadingIndicator.visible = false;
	}

	static setContinueDetails() {
		const saves = GameSavesAPI.GetGameSaves()
			.sort((a, b) => Number(b.fileTime) - Number(a.fileTime))
			.filter((a) => { return a.mapGroup === this.selectedCampaign.id });
		
		this.continueBtn.enabled = false;
		this.continueText.text = $.Localize('MainMenu_SaveRestore_NoSaves');

		if (saves.length === 0) {
			$.Warning('CONTINUE: No saves');
			return;
		}

		this.latestSave = saves[0];

		const savChapter = this.selectedCampaign.chapters.find((ch) => {
			return ch.maps.find((map) => {
				return map.name === this.latestSave.mapName;
			}) !== undefined;
		});

		if (!savChapter) {
			$.Warning('CONTINUE: Map could not be found for Campaign');
			return;
		}

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);

		this.continueText.text = `${savChapter.title}`;
		this.continueHeadline.text = `${this.latestSave.mapName}`;
		this.continueTagline.text = `${new Date(Number(this.latestSave.fileTime) * 1000).toDateString()}`
	
		this.continueBtn.SetPanelEvent(
			'onactivate',
			() => {
				if (GameInterfaceAPI.GetGameUIState() === GameUIState.PAUSEMENU) {
					UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
						$.Localize('#Action_LoadGame_Confirm'),
						$.Localize('#Action_LoadGame_Auto_Message'),
						'warning-popup',
						$.Localize('#Action_LoadGame'),
						() => {
							CampaignAPI.ContinueCampaign(this.selectedCampaign.id);
						},
						$.Localize('#UI_Cancel'),
						() => {},
						'blur'
					);
				} else {
					CampaignAPI.ContinueCampaign(this.selectedCampaign.id);
				}
			}
		);

		this.continueBtn.enabled = true;
	}

	static onBackgroundMapLoaded(map: string, isBackgroundMap: boolean) {
		if (this.isBlurred && isBackgroundMap) {
			this.switchReverse();
			this.movie.visible = false;
			this.imgBg.visible = false;
		}
	}

	// set campaign details
	// background map takes priority
	// then background movie
	// then background image
	//
	// this function returns true if the reverse anim should be delayed
	static setCampaignMenuDetails() {
		this.movie = $<Movie>('#MainMenuMovie')!;

		const bgl = CampaignAPI.GetBackgroundLevel();
		const bgm = CampaignAPI.GetBackgroundMovie();
		const bgi = CampaignAPI.GetBackgroundImage();

		if (bgl.length > 0) {
			this.imgBg.visible = true;
			this.imgBg.SetImage(`file://{materials}/${bgi}`);
			$.Schedule(0.001, () => GameInterfaceAPI.ConsoleCommand(`map_background ${bgl}`));
		} else if (bgm.length > 0) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			this.movie.SetMovie(`file://{media}/${bgm}`);
			this.movie.Play();
			this.movie.visible = true;
		} else if (bgi.length > 0) {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			this.imgBg.visible = true;
			this.imgBg.SetImage(`file://{materials}/${bgi}`);
			this.movie.visible = false;
		}

		$.Schedule(0.001, () => { $.PlaySoundEvent(CampaignAPI.GetBackgroundMusic()) });

		return bgl.length > 0;
	}

	static switchFade() {
		$.PlaySoundEvent('UIPanorama.Music.StopAll');
		this.movie = $<Movie>('#MainMenuMovie')!;
		this.movie.Stop();

		this.menuContent.AddClass('mainmenu__content__t-prop');
		this.menuContent.AddClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-switch-reverse');
		this.switchBlur.AddClass('anim-main-menu-switch');

		this.isBlurred = true;
	}

	static switchReverse() {
		this.menuContent.RemoveClass('mainmenu__content__t-prop');
		this.menuContent.RemoveClass('mainmenu__content__anim');
		this.switchBlur.RemoveClass('anim-main-menu-switch');
		this.switchBlur.AddClass('anim-main-menu-switch-reverse');
		this.pageInsert.RemoveAndDeleteChildren();

		this.isBlurred = false;
		this.loadingIndicator.visible = false;
	}

	static onCampaignSelected(id: string) {
		this.loadingIndicator.visible = true;

		const campaign = CampaignAPI.GetAllCampaigns().find((v) => { return v.id === id });
		if (!campaign) {
			$.Warning(`Menu: Campaign ID ${id} received but that's not a valid Campaign?`);
			return;
		}

		this.selectedCampaign = campaign;
		CampaignAPI.SetActiveCampaign(this.selectedCampaign.id);
		UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] = campaign;

		$.GetContextPanel().AddClass('CampaignSelected');

		// TODO: Set logo image appropriately
		this.logo.SetImage('file://{images}/menu/portal2/full_logo.svg');
		this.campaignDevTxt.text = `[DEV] Campaign: ${campaign.title} (${id})`;
	
		this.setContinueDetails();
		if (!this.setCampaignMenuDetails()) {
			this.switchReverse();
		}
	}

	static exitCampaign() {
		$.GetContextPanel().RemoveClass('CampaignSelected');

		UiToolkitAPI.GetGlobalObject()['ActiveUiCampaign'] = undefined;
		this.logo.SetImage('file://{images}/logo.svg');
		this.campaignDevTxt.text = '[DEV] No Campaign Active';

		MainMenu.setContinueDetails();
	}
}
