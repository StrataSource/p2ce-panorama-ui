'use strict';

// caption helper class. current implementation does **not** require this
// but obviously we need to reimplement standard caption behavior
//
// sourcemods can do fancier stuff for themselves, though, like in-world
// captions...
class CaptionEntry {
	// this is not how long the caption should live for, but
	// when the caption should die out in server time
	lifetime: number;
	// the belonging text panel
	panel: Label;
	dummy: Panel;
	// fade once
	bMarkedForDeletion: boolean = false;
	bReadyToPurge: boolean = false;
	height: number;
	token: string;

	constructor(token: string, caption: Caption, lifetime: number) {
		this.lifetime = lifetime;

		this.token = token;

		let style = `font-size: ${CloseCaptioning.settings.fontSize}px;`;
		style += `text-align: ${CloseCaptioning.settings.textAlign === 0 ? 'left' : 'center'};`;
		switch (CloseCaptioning.settings.fontType) {
			default:
			case 0:
				style += "font-family: 'GorDIN';";
				break;

			case 1:
				style += "font-family: 'Univers LT Std 47 Cn Lt';";
				break;

			case 2:
				style += "font-family: 'Lexend Deca';transform: translateY(-1px);";
				break;

			case 3:
				style += "font-family: 'Verdana';";
				break;
		}
		if (CloseCaptioning.settings.bgOpacity === 0.0) {
			style += 'text-shadow: 2px 2px 1px 2 rgb(0,0,0);';
		}

		// create the text
		this.panel = $.CreatePanel('Label', $<Panel>('#CaptionsBox')!, token, {
			class: 'closecaptions__text',
			style: style,
			// marked to process as html to
			// support bold & italicization tags
			html: true,
			text: caption.text
		});

		this.dummy = $.CreatePanel('Panel', $<Panel>('#CaptionsBg')!, `Dummy_${token}`, {
			class: 'closecaptions__dummy'
		});

		this.panel.style.width = `${CloseCaptioning.CAPTION_WIDTH}px`;
		this.dummy.style.width = `${CloseCaptioning.CAPTION_WIDTH}px`;

		// we use the panel text here because it stripped out all the tags
		// the width would be incorrect if we used the caption text directly since
		// it would factor those in!
		this.height = this.panel.GetHeightForText(CloseCaptioning.CAPTION_WIDTH, this.panel.text);

		// show the text
		this.panel.style.opacity = 1;
		this.panel.style.height = `${this.height}px`;
		// 4 comes from text margins
		this.dummy.style.height = `${this.height + 4}px`;

		$.RegisterEventHandler(
			'PropertyTransitionEnd',
			this.panel,
			(s: string, prop: keyof Style) => {
				if (prop === 'opacity' && this.panel.IsTransparent()) {
					this.dummy.style.height = '0px';
					$.RegisterEventHandler(
						'PropertyTransitionEnd',
						this.dummy,
						(s: string, prop: keyof Style) => {
							if (prop === 'height') {
								// assume it's 0
								this.bReadyToPurge = true;
							}
						}
					);
				}
			}
		);
	}

	FadeOut() {
		if (!this.panel.IsValid() || this.bMarkedForDeletion) return;
		this.panel.style.opacity = 0;
		this.bMarkedForDeletion = true;
	}
}

// there's still some TODO stuff but it's pretty much functional i think...
class CloseCaptioning {
	static captions: Array<CaptionEntry> = [];
	static box = $<Panel>('#CaptionsBox')!;
	static bg = $<Panel>('#CaptionsBg')!;
	static CAPTION_WIDTH = 1102;

	static settings = {
		bgOpacity: 0.75,
		fontSize: 20,
		fontType: 0,
		textAlign: 0,
		boxWidth: 1102
	}

	static getVars() {
		// FIX SETTING SLIDERS BEFORE TURNING THIS ON
		//const bgOpacity = $.persistentStorage.getItem(CCSetting.BG_OPACITY);
		//if (bgOpacity === null) {
		//	$.persistentStorage.setItem(CCSetting.BG_OPACITY, this.settings.bgOpacity);
		//} else {
		//	this.settings.bgOpacity = Number(bgOpacity);
		//}
		//this.bg.style.backgroundColor = `rgba(0,0,0,${bgOpacity})`;

		//const fontSize = $.persistentStorage.getItem(CCSetting.FONT_SIZE);
		//if (fontSize === null) {
		//	$.persistentStorage.setItem(CCSetting.FONT_SIZE, this.settings.fontSize);
		//} else {
		//	this.settings.fontSize = Number(fontSize);
		//}

		const fontType = $.persistentStorage.getItem(CCSetting.FONT_TYPE);
		if (fontType === null) {
			$.persistentStorage.setItem(CCSetting.FONT_TYPE, this.settings.fontType);
		} else {
			this.settings.fontType = Number(fontType);
		}

		const textAlign = $.persistentStorage.getItem(CCSetting.TEXT_ALIGN);
		if (textAlign === null) {
			$.persistentStorage.setItem(CCSetting.TEXT_ALIGN, this.settings.textAlign);
		} else {
			this.settings.textAlign = Number(textAlign);
		}

		$.Msg(`${JSON.stringify(this.settings)}`);
	}

	static {
		this.getVars();

		$.RegisterForUnhandledEvent('ReloadCCSettings', () => {
			this.wipeCaptions();
			this.getVars();
		});

		$.RegisterForUnhandledEvent('GameUIStateChanged',  (old: GameUIState, newS: GameUIState) => {
			this.updateStyle();
		});

		// cc_emit_raw - allows users to display their own arbitrary text
		// preprocessing not supported
		$.RegisterEventHandler('DisplayRawCaptionRequest', $.GetContextPanel(), (text: string, lifetime: number) => {
			this.captions.push(
				new CaptionEntry(
					'RAW_CAPTION',
					{
						bLowPriority: false,
						bSFX: false,
						nNoRepeat: 0,
						nDelay: 0,
						flLifetimeOverride: -1.0,
						text: text,
						options: new Map<string, string>()
					},
					lifetime
				)
			);
			this.showBox();
		});

		// check for captions that finished and delete them
		$.RegisterEventHandler('CaptionTick', $.GetContextPanel(), (time: number) => {
			for (const caption of this.captions) {
				if (time >= caption.lifetime && caption.panel.IsValid() && caption.dummy.IsValid()) {
					if (caption.bReadyToPurge) {
						caption.panel.DeleteAsync(0);
						caption.dummy.DeleteAsync(0);
						this.captions.shift();
						if (this.captions.length <= 0) {
							this.hideBox();
						}
					} else {
						caption.FadeOut();
					}
				} else {
					// seems like the original behavior removed captions top down (visually)
					// and stopped when a caption was still playing. so when we get to a caption
					// still living, we will stop checking this tick
					break;
				}
			}
		});

		// when a caption is missing. must have cc_captiontrace
		$.RegisterEventHandler('BadCaptionRequest', $.GetContextPanel(), (token: string, lifetime: number) => {
			this.captions.push(
				new CaptionEntry(
					token,
					{
						bLowPriority: false,
						bSFX: false,
						nNoRepeat: 0,
						nDelay: 0,
						flLifetimeOverride: -1.0,
						text: `[MISSING] ${token}`,
						options: new Map<string, string>()
					},
					lifetime
				)
			);

			// display the caption box
			this.showBox();
		});

		// display standard captions via token, usually from scenes
		$.RegisterEventHandler('DisplayCaptionRequest', $.GetContextPanel(), (token: string, caption: Caption, lifetime: number) => {
			// do not display multiple of the same
			// TODO: include norepeat field instead of blatantly disregarding refires
			//if (this.captions.has(token)) {
			//	const showmissing = GameInterfaceAPI.GetSettingInt('cc_captiontrace');
			//	if (showmissing > 0) {
			//		$.Warning(`Ignoring refire for caption '${token}'`);
			//	}
			//	return;
			//}

			// record caption
			this.captions.push(new CaptionEntry(token, caption, lifetime));

			this.showBox();
		});
		
		// clear captions
		$.RegisterForUnhandledEvent('MapUnloaded', () => {
			this.wipeCaptions();
		});
		$.RegisterForUnhandledEvent('MapLoaded', () => {
			this.wipeCaptions();
		});

		this.updateStyle();
	}

	static updateStyle() {
		$.GetContextPanel().SetHasClass('MainMenu', GameInterfaceAPI.GetGameUIState() === GameUIState.MAINMENU);
	}

	// hide caption box when no more captions are being displayed
	// need to make this a bit better
	static updateVisibility() {
		if (this.captions.length - 1 <= 0) {
			this.hideBox();
		}
	}

	static showBox() {
		this.bg.style.opacity = 1;
	}

	static hideBox() {
		this.bg.style.opacity = 0;
	}

	static wipeCaptions() {
		this.captions = [];
		this.box.RemoveAndDeleteChildren();
		this.bg.RemoveAndDeleteChildren();
		this.hideBox();
	}
}
