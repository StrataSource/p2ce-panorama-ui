'use strict';

class BaseMenu {
	static buttons: MenuButton[] = [
		{
			id: 'DevBtn',
			headline: '#MainMenu_Navigation_Developer',
			tagline: '#MainMenu_Navigation_Developer_Tagline',
			activated: () => {
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'Dev',
					'main-menu/developer',
					undefined
				);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		},
		{
			id: 'PlayBtn',
			headline: '#MainMenu_Navigation_Play',
			tagline: '#MainMenu_Navigation_Play_Tagline',
			activated: () => {
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'Play',
					'play-menu/player-mode',
					undefined
				);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		},
		{
			id: 'CampaignContinueBtn',
			headline: '#MainMenu_Campaigns_MM_Resume',
			tagline: '[PH] ????',
			activated: () => {
				GameInterfaceAPI.ConsoleCommand('disconnect');
				$.Schedule(0.1, () => {
					CampaignAPI.ContinueCampaign(this.savCampaign!.id);
				});
			},
			hovered: () => {
				if (this.isContinueActive) return;
				if (!this.continueBtn.enabled) return;
				if (!this.savCampaign) return;
				if (!this.savChapter) return;

				this.isContinueActive = true;
				this.continueImg.style.animation = 'FadeOut 0.2s ease-out 0s 1 reverse forwards';
				//this.pageBg.style.animation = 'FadeOut 0.2s ease-out 0s 1 reverse forwards';
				//this.bgCredit.style.animation = 'FadeOut 0.2s ease-out 0s 1 normal forwards';

				const logoPath = this.savCampaign.meta[CampaignMeta.FULL_LOGO];
				if (logoPath !== undefined) {
					$.DispatchEvent('MainMenuSetLogo', logoPath);
					//this.menuLogo.style.animation = 'FadeIn 0.2s ease-out 0s 1 normal forwards';
					//const kfs = this.pageHeadline.CreateCopyOfCSSKeyframes('FadeIn');
					//this.menuLogo.UpdateCurrentAnimationKeyframes(kfs);
				} else {
					// TODO: hide logo
					$.Msg('Hide logo');
				}

				const date = new Date(Number(this.latestSave.fileTime));
				this.continueText.text = `${$.Localize(this.savChapter.title)} [${convertTime(date, false)}]`;

				this.continueLogo.AddClass('mainmenu__square-logo__anim');
			},
			unhovered: () => {
				if (!this.isContinueActive) return;

				this.isContinueActive = false;

				///this.bgCredit.style.animation = 'FadeIn 0.2s ease-out 0s 1 normal forwards';
				//this.pageBg.style.animation = 'FadeOut 0.2s ease-out 0s 1 normal forwards';
				this.continueImg.style.animation = 'FadeOut  0.2s ease-out 0s 1 normal forwards';
				$.DispatchEvent('MainMenuSetLogo', '{images}/logo.svg');

				if (this.savCampaign) this.continueText.text = $.Localize(this.savCampaign.title);

				this.continueLogo.RemoveClass('mainmenu__square-logo__anim');
			},
			focusIsHover: true
		},
		{
			id: 'AddonsBtn',
			headline: '#MainMenu_Navigation_Addons',
			tagline: '#MainMenu_Navigation_Addons_Tagline',
			activated: () => {
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'Content',
					'main-menu/addons',
					undefined
				);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		},
		{
			id: 'SettingsBtn',
			headline: '#MainMenu_Navigation_Options',
			tagline: '#MainMenu_Navigation_Options_Tagline',
			activated: () => {
				$.DispatchEvent(
					'MainMenuOpenNestedPage',
					'Settings',
					'settings/settings',
					undefined
				);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		},
		{
			id: 'QuitBtn',
			headline: '#MainMenu_Navigation_QuitGame',
			tagline: '#MainMenu_Navigation_QuitGame_Tagline',
			activated: () => {
				UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
					$.Localize('#Action_Quit'),
					$.Localize('#Action_Quit_Message'),
					'warning-popup',
					$.Localize('#Action_Quit'),
					() => { GameInterfaceAPI.ConsoleCommand('quit'); },
					$.Localize('#Action_Return'),
					() => {},
					'blur'
				);
			},
			hovered: () => {},
			unhovered: () => {},
			focused: () => {}
		}
	];

	static latestSave: GameSave;
	static savCampaign: CampaignInfo | undefined = undefined;
	static savChapter: ChapterInfo | undefined = undefined;
	static isContinueActive: boolean = false;

	static continueImg: Image;
	static continueBtn: Button;
	static continueLogo: Image;
	static continueText: Label;

	static bgMapLoad: uuid | undefined = undefined;

	static mapSelection = 0;
	static maps = ['p2ce_background_laser_intro', 'p2ce_background_gentle_hum'];

	static onLoad() {
		for (const btn of this.buttons) {
			if (btn.id === 'CampaignContinueBtn') {
				const b = constructMenuButton(btn);
				this.continueBtn = b;

				const text =  b.FindChildTraverse('CampaignContinueBtn_Tagline');

				if (text) {
					this.continueText = text as Label;
				} else {
					throw new Error('Cannot find tagline text for resume button!');
				}

				$.DispatchEvent(
					'MainMenuAddPreConstructedButton',
					b
				);

				continue;
			}
			
			$.DispatchEvent(
				'MainMenuAddButton',
				btn
			);
		}

		$.RegisterForUnhandledEvent('MainBackgroundLoaded', () =>{
			this.showPrereleaseWarning();
			if (GameStateAPI.IsPlaytest()) this.showPlaytestConsentPopup();
		});

		$.DispatchEvent(
			'MainMenuSetLogo',
			'{images}/logo.svg'
		);

		// create Resume details
		const p = $.CreatePanel('Panel', $.GetContextPanel(), 'MenuBackgroundLayer');
		p.SetReadyForDisplay(false);
		p.LoadLayoutSnippet('MenuBackgroundLayer');
		$.DispatchEvent('MainMenuAddBgPanel', p);

		const bg = p.FindChildTraverse('MainMenuSaveBackground');
		const logo = p.FindChildTraverse('ContinueSaveLogo');
		if (bg) {
			this.continueImg = bg as Image;
			this.continueImg.style.animation = 'FadeOut 0.01s ease-out 0s 1 normal forwards';
		} else {
			throw new Error('MainMenuSaveBackground could not be found.');
		}
		if (logo) {
			this.continueLogo = logo as Image;
		} else {
			throw new Error('ContinueSaveLogo could not be found.');
		}

		this.setContinueDetails();

		$.DispatchEvent('MainMenuHideBackgroundMovie');

		// load featured Background
		this.loadBackground();
	}

	static setContinueDetails() {
		this.continueBtn.enabled = false;
		this.continueBtn.visible = false;

		const saves = GameSavesAPI.GetGameSaves().sort((a, b) => Number(b.fileTime) - Number(a.fileTime));

		this.savCampaign = undefined;
		this.savChapter = undefined;

		if (saves.length === 0) {
			$.Warning('CONTINUE: No saves');
			return;
		}

		this.latestSave = saves[0];

		const campaigns = CampaignAPI.GetAllCampaigns();
		const savCampaign = campaigns.find((v) => {
			return v.id === this.latestSave.mapGroup;
		});

		if (!savCampaign) {
			$.Warning('CONTINUE: Save exists, but the campaign it belongs to cannot be found.');
			$.Warning(`Group: ${this.latestSave.mapGroup}`);
			return;
		}

		const savChapter = savCampaign.chapters.find((ch) => {
			return (
				ch.maps.find((map) => {
					return map.name === this.latestSave.mapName || map.name === `${this.latestSave.mapName}.bsp`;
				}) !== undefined
			);
		});

		if (!savChapter) {
			$.Warning('CONTINUE: Map could not be found for Campaign');
			return;
		}

		const thumb = `file://{__saves}/${this.latestSave.fileName.replace('.sav', '.tga')}`;
		this.continueImg.SetImage(thumb);
		this.continueLogo.SetImage(`file://${savCampaign.meta[CampaignMeta.SQUARE_LOGO]}`);

		this.continueText.text = `${$.Localize(savCampaign.title)}`;

		this.continueBtn.enabled = true;
		this.continueBtn.visible = true;

		this.savCampaign = savCampaign;
		this.savChapter = savChapter;
	}

	static rerollMap() {
		this.mapSelection = Math.floor(Math.random() * this.maps.length);
		$.Msg(`Rolled background map: ${this.mapSelection}, ${this.maps[this.mapSelection]}`);
	}

	static loadBackground() {
		// TODO: check for BG Map Option
		this.rerollMap();
		// eslint-disable-next-line no-constant-condition
		if (false) {
			this.loadStaticBg();
		} else {
			this.loadLiveBg();
		}
	}

	static loadStaticBg() {
		$.DispatchEvent('MainMenuShowBackgroundImage', `{images}/menu/featured/${this.maps[this.mapSelection]}.png`, true);
		$.DispatchEvent('MainMenuSwitchReverse', false);
		$.DispatchEvent('MainBackgroundLoaded');
	}

	static loadLiveBg() {
		// load up a random map from our pool
		$.DispatchEvent('MainMenuSetLoadingIndicatorVisibility', true);

		// set fallback
		$.DispatchEvent('MainMenuShowBackgroundImage', `{images}/menu/featured/${this.maps[this.mapSelection]}.png`, false);

		if (this.bgMapLoad === undefined) {
			this.bgMapLoad = GameInterfaceAPI.RegisterGameEventHandler(
				'map_load_failed',
				(mapName: string, isBackgroundMap: boolean) => {
					if (!isBackgroundMap || mapName !== `maps\\${this.maps[this.mapSelection]}.bsp`) return;
					$.Warning('!!!!! Could not load featured background map !!!!!');
					$.Schedule(0.001, () => {
						$.DispatchEvent('MainMenuSwitchReverse', false);
						$.DispatchEvent('MainBackgroundLoaded');
					});
				}
			);
		}

		$.RegisterForUnhandledEvent('MapLoaded', (map: string, bg: boolean) => {
			if (bg && map === `maps\\${this.maps[this.mapSelection]}.bsp`) {
				$.DispatchEvent('MainMenuHideBackgroundImage', false);
				$.DispatchEvent('MainMenuSwitchReverse', false);
				$.DispatchEvent('MainBackgroundLoaded');
			} else {
				$.Warning(`Map loaded, but it failed to pass base bg map check. bgLevel = ${this.maps[this.mapSelection]}, map = ${map}, bg: ${bg}`);
			}
		});

		$.Schedule(0.01, () => {
			GameInterfaceAPI.ConsoleCommand('disconnect');
			GameInterfaceAPI.ConsoleCommand(`map_background ${this.maps[this.mapSelection]}`);
		});
	}

	/**
	 * Shows playtest consent form
	 */
	static showPlaytestConsentPopup() {
		if (!DosaHandler.checkDosa('playtestConsent'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/playtest-consent.xml',
				'dosaKey=playtestConsent&dosaNameToken=Dosa_PlaytestConsent'
			);
	}

	/**
	 * Shows prerelease notice form
	 */
	static showPrereleaseWarning() {
		if (!DosaHandler.checkDosa('prereleaseAck'))
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/prerelease-warn-dialog.xml',
				'dosaKey=prereleaseAck&dosaNameToken=Dosa_PrereleaseAck'
			);
	}
}
