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

	constructor(token: string, caption: Caption, lifetime: number) {
		this.lifetime = lifetime;

		// create the text
		this.panel = $.CreatePanel('Label', $<Panel>('#CaptionsBox')!, token, {
			class: 'closecaptions__text',
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
		const height = this.panel.GetHeightForText(CloseCaptioning.CAPTION_WIDTH, this.panel.text);

		// show the text
		this.panel.style.opacity = 1;
		this.panel.style.height = `${height}px`;
		// 4 comes from text margins
		this.dummy.style.height = `${height + 4}px`;
	}

	FadeOut() {
		if (!this.panel.IsValid() || this.bMarkedForDeletion) return;
		// TODO: fade out first THEN shrink the dummy!!!
		this.panel.style.opacity = 0;
		this.dummy.style.height = '0px';
		this.bMarkedForDeletion = true;
	}
}

// there's still some TODO stuff but it's pretty much functional i think...
class CloseCaptioning {
	static captions: Map<string, CaptionEntry> = new Map<string, CaptionEntry>();
	static box = $<Panel>('#CaptionsBox')!;
	static bg = $<Panel>('#CaptionsBg')!;
	static CAPTION_WIDTH = 1102;

	static {
		// cc_emit_raw - allows users to display their own arbitrary text
		// preprocessing not supported
		$.RegisterEventHandler('DisplayRawCaptionRequest', $.GetContextPanel(), (text: string, lifetime: number) => {
			this.captions.set(
				'RAW_CAPTION',
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
			for (const [key, caption] of this.captions) {
				if (time >= caption.lifetime) {
					if (caption.panel.IsTransparent()) {
						caption.panel.DeleteAsync(0);
						caption.dummy.DeleteAsync(0);
						this.captions.delete(key);
						if (this.captions.size <= 0) {
							this.hideBox();
						}
					} else {
						caption.FadeOut();
						this.updateVisibility();
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
			this.captions.set(
				token,
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
			if (this.captions.has(token)) {
				const showmissing = GameInterfaceAPI.GetSettingInt('cc_captiontrace');
				if (showmissing > 0) {
					$.Warning(`Ignoring refire for caption '${token}'`);
				}
				return;
			}

			// record caption
			this.captions.set(token, new CaptionEntry(token, caption, lifetime));

			this.showBox();
		});
		
		// clear captions
		$.RegisterForUnhandledEvent('MapUnloaded', () => {
			this.wipeCaptions();
		});
		$.RegisterForUnhandledEvent('MapLoaded', () => {
			this.wipeCaptions();
		});
	}

	// hide caption box when no more captions are being displayed
	// need to make this a bit better
	static updateVisibility() {
		if (this.captions.size - 1 <= 0) {
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
		this.captions.clear();
		this.box.RemoveAndDeleteChildren();
		this.bg.RemoveAndDeleteChildren();
		this.hideBox();
	}
}
