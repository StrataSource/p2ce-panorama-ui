'use strict';

// caption helper class. current implementation does **not** require this
// but obviously we need to reimplement standard caption behavior
//
// sourcemods can do fancier stuff for themselves, though, like in-world
// captions...
class CaptionEntry {
	emitTime: number;
	// the belonging text panel
	panel: Label;
	backer: Panel;
	token: string;
	bIsLowPriority: boolean;
	bDelete: boolean;
	height: number;

	constructor(token: string, caption: Caption, emitTime: number) {
		this.bIsLowPriority = caption.bSFX || caption.bLowPriority;
		this.emitTime = emitTime;
		this.token = token;

		let style = `font-size: ${CloseCaptioning.settings.fontSize}px;`;
		switch (CloseCaptioning.settings.textAlign) {
			default:
			case 0:
				style += 'text-align: left;';
				break;

			case 1:
				style += 'text-align: center;';
				break;

			case 2:
				style += 'text-align: right;';
				break;
		}
		switch (CloseCaptioning.settings.fontType) {
			default:
			case 0:
				style += "font-family: 'Lexend';transform: translateY(-2px);";
				break;

			case 1:
				style += "font-family: 'Univers LT Std 47 Cn Lt';";
				break;

			case 2:
				style += `font-family: 'GorDIN';line-height: ${Math.ceil(CloseCaptioning.settings.fontSize / 20 * 24)}px`;
				break;

			case 3:
				style += "font-family: 'Verdana';";
				break;

			case 4:
				style += "font-family: 'Noto Sans';";
				break;

			case 5:
				style += "font-family: 'Stratum2';";
				break;
		}
		if (CloseCaptioning.settings.bgOpacity <= 0.0) {
			style += 'text-shadow: 0px 0px 3px 2 #000000;';
		}

		this.bDelete = false;

		this.backer = $.CreatePanel('Panel', $<Panel>('#CaptionsBox')!, token, {
			class: 'closecaptions__dummy'
		});

		// create the text
		this.panel = $.CreatePanel('Label', this.backer, token, {
			class: 'closecaptions__text',
			style: style,
			// marked to process as html to
			// support bold & italicization tags
			html: true,
			text: caption.text
		});

		this.backer.style.width = `${CloseCaptioning.CAPTION_WIDTH}px`;

		// show the text
		this.panel.style.opacity = 1;
		this.height = this.panel.GetHeightForText(CloseCaptioning.CAPTION_WIDTH, this.panel.text);
		//this.backer.style.height = `${this.height + CloseCaptioning.settings.margin}px`;
		this.backer.style.padding = `${Math.floor(CloseCaptioning.settings.margin / 2)}px 0`;

		$.RegisterEventHandler('PropertyTransitionEnd', this.panel, (s: string, prop: keyof Style) => {
			// when the text has fully faded out, animate the height to 0
			if (prop === 'opacity' && this.panel.IsTransparent()) {
				this.backer.style.height = '0px';
				$.RegisterEventHandler('PropertyTransitionEnd', this.backer, (s: string, prop: keyof Style) => {
					if (prop === 'height') {
						this.panel.DeleteAsync(0);
						CloseCaptioning.deleteToken(token);
						CloseCaptioning.updateVisibility();
					}
				});
			}
		});
	}

	FadeOut() {
		this.panel.style.opacity = 0;
	}
}

// there's still some TODO stuff but it's pretty much functional i think...
class CloseCaptioning {
	static captions: Map<string, Array<CaptionEntry>> = new Map();
	static box = $<Panel>('#CaptionsBox')!;
	static CAPTION_WIDTH = 1102;
	static MAX_ENTRIES = 4;

	static settings = {
		bgOpacity: 0.75,
		fontSize: 20,
		fontType: 0,
		textAlign: 0,
		boxWidth: 1102,
		margin: 6
	};

	static getVars() {
		this.settings.fontSize = GameInterfaceAPI.GetSettingInt('cc_panorama_font_size');
		this.settings.bgOpacity = GameInterfaceAPI.GetSettingFloat('cc_panorama_bg_opacity');
		this.settings.margin = GameInterfaceAPI.GetSettingInt('cc_panorama_entry_margin');

		this.box.style.backgroundColor = `rgba(0,0,0,${this.settings.bgOpacity})`;

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
	}

	static deleteToken(token: string) {
		const captionList = this.captions.get(token);
		if (!captionList) return;
		captionList.shift();
		CloseCaptioning.updateVisibility();
	}

	static addCaption(token: string, caption: CaptionEntry) {
		if (!this.checkSizeAndPopIfNecessary(caption.bIsLowPriority)) {
			$.Warning(`${token} rejected!`);
			return;
		}

		let captionList = this.captions.get(token);

		if (!captionList) {
			this.captions.set(token, []);
			captionList = this.captions.get(token)!;
		}

		captionList.push(caption);

		// display the caption box
		this.showBox();
	}

	static checkSizeAndPopIfNecessary(bIsNewLowPriority: boolean) : boolean {
		return true;
		const lowestTimeGlobal = { token: '', emitTime: 999999999 };
		const lowestTimeLowPriority = { token: '', emitTime: 999999999 };
		let captionCount = 0;
		let lowPriorityCount = 0;
		for (const [token, list] of this.captions) {
			captionCount += list.length;
			for (const caption of list) {
				if (caption.bIsLowPriority) {
					lowPriorityCount += 1;
					if (caption.emitTime <= lowestTimeLowPriority.emitTime) {
						lowestTimeLowPriority.token = token;
						lowestTimeLowPriority.emitTime = caption.emitTime;
					}
				}
				if (caption.emitTime <= lowestTimeGlobal.emitTime) {
					lowestTimeGlobal.token = token;
					lowestTimeGlobal.emitTime = caption.emitTime;
				}
			}
		}
		$.Msg(`${captionCount} > ${this.MAX_ENTRIES}`);
		if (captionCount > this.MAX_ENTRIES) {
			// replace lowest priority ones if there are any
			if (lowPriorityCount > 0) {
				// existence of lowestTimeLowPriority is implicit
				$.Msg(`Caption count exceeded (${captionCount} > ${this.MAX_ENTRIES}), removing: '${lowestTimeLowPriority.token}'`);
				ClosedCaptionsAPI.RemoveCaption(lowestTimeLowPriority.token);
				return true;
			// if the incoming caption is low priority and there's no space, give up
			} else if (bIsNewLowPriority) {
				$.Warning(`Caption count exceeded (${captionCount} > ${this.MAX_ENTRIES}), no space for any more!`);
				return false;
			}
			// for everything else, get rid of the least lifetime one
			$.Msg(`Caption count exceeded (${captionCount} > ${this.MAX_ENTRIES}), removing: '${lowestTimeGlobal.token}'`);
			ClosedCaptionsAPI.RemoveCaption(lowestTimeGlobal.token);
			return true;
		}
		return true;
	}

	static {
		this.getVars();

		$.RegisterForUnhandledEvent('ReloadCCSettings', () => {
			this.wipeCaptions();
			this.getVars();
		});

		$.RegisterForUnhandledEvent('GameUIStateChanged', (old: GameUIState, newS: GameUIState) => {
			this.updateStyle();
		});

		$.RegisterEventHandler('EndCaption', $.GetContextPanel(), (token: string) => {
			const captionList = this.captions.get(token);
			if (!captionList) {
				return;
			};
			if (captionList.length === 0) {
				return;
			};
			const caption = captionList[0];
			caption.FadeOut();
		});

		// when a caption is missing. must have cc_captiontrace
		$.RegisterEventHandler('BadCaption', $.GetContextPanel(), (token: string, lifetime: number, emitTime: number) => {
			this.addCaption(token,
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
					emitTime
				)
			);
		});

		// display standard captions via token, usually from scenes
		$.RegisterEventHandler(
			'DisplayCaption',
			$.GetContextPanel(),
			(token: string, caption: Caption, lifetime: number, emitTime: number) => {
				this.addCaption(token, new CaptionEntry(token, caption, emitTime));
			}
		);

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
	static updateVisibility() {
		for (const [token, list] of this.captions) {
			if (list.length > 0)
				return;
		}
		this.hideBox();
	}

	static showBox() {
		this.box.style.opacity = 1;
	}

	static hideBox() {
		this.box.style.opacity = 0;
	}

	static wipeCaptions() {
		this.captions.clear();
		this.box.RemoveAndDeleteChildren();
		this.hideBox();
	}
}
