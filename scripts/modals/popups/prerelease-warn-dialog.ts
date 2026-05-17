'use strict';

class PrereleaseAck {
	static {
		$.RegisterEventHandler('PanelStyleChanged', $.GetContextPanel(), () => {
			// popup was forcibly dismissed for some reason. check DOSA.
			if ($.GetContextPanel().HasClass('Hidden')) {
				if (!DosaHandler.checkDosa('prereleaseAck')) {
					GameInterfaceAPI.ConsoleCommand('quit');
				}
			}
		});
	}

	static onLoad() {
		const decline = $('#DeclineBtn')!;
		decline.SetFocus();
		const accept = $('#ContinueButton')!;
		const previouslyAcknowledged = DosaHandler.checkDosa('prereleaseAck');
		accept.enabled = previouslyAcknowledged;
		const checkbox = $<ToggleButton>('#Checkbox')!;
		checkbox.SetSelected(previouslyAcknowledged);
		checkbox.enabled = !previouslyAcknowledged;
		decline.visible = !previouslyAcknowledged;
	}

	static onDOSA() {
		DosaHandler.handleDosaButton($.GetContextPanel());
		UiToolkitAPI.CloseAllVisiblePopups();
	}

	static checkboxChanged() {
		$<Button>('#ContinueButton')!.enabled = $<ToggleButton>('#Checkbox')!.IsSelected();
	}
}
