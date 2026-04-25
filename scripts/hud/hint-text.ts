'use strict';

class HudHintText {
	static readonly hintShowTime = 10;
	static hintDisplaySchedule: uuid | null = null;
	
	static panel: Panel;
	static label: Label;
	
	// the appropriate function call would be something like this once the relevant
	// pano UI event is impl'd:
	//
	// static onShowHudHintText(hintMessage: string) {

	static onShowHudHintText() {
		try {
			// cancel all schedules first
			HudHintText.cancelPendingSchedules();
			HudHintText.panel.RemoveClass('hud-hint__hide');
			HudHintText.panel.RemoveClass('hud-hint__show');
			
			// localize text first. ideally should be something like:
			// const hintLabel = HudHintText.label;
			// hintLabel.text = $.Localize(hintMessage);

			const hintLabel = HudHintText.label;
			hintLabel.text = $.Localize(hintLabel.text);
			
			// show our hint text
			$.Warning('Showing hint text');
			HudHintText.showSchedule();
		} catch (err) {
			$.Warning('Hint text display attempt failed!\nJS exception details: ' + err);
		}
	}
	
	static show() {
		HudHintText.panel.RemoveClass('hud-hint__hide');
		HudHintText.panel.AddClass('hud-hint__show');
	}
	
	static hide() {
		HudHintText.panel.RemoveClass('hud-hint__show');
		HudHintText.panel.AddClass('hud-hint__hide');
	}
	
	static cancelPendingSchedules() {
		if (HudHintText.hintDisplaySchedule !== null) {
			try {
				// Cancel existing hint display schedule...
				$.CancelScheduled(HudHintText.hintDisplaySchedule);
			} catch (err) {
				// Do nothing
			}
			HudHintText.hintDisplaySchedule = null;
		}
	}
	
	static showSchedule() {
		// time it
		this.hintDisplaySchedule = $.Schedule(HudHintText.hintShowTime, this.hide);
		this.show();
	}
	
	static {
		// init and hide first
		HudHintText.panel = $('#HintPanel') as Panel;
		HudHintText.label = $('#HintLabel') as Label;
		
		HudHintText.panel.visible = false;
		
		// this really needs its own internal pano UI event
		// right now it's bound to HidePauseMenu for testing reasons
		// $.RegisterForUnhandledEvent('ShowHudHintText', this.onShowHudHintText);
		$.RegisterForUnhandledEvent('HidePauseMenu', this.onShowHudHintText);
	}
}