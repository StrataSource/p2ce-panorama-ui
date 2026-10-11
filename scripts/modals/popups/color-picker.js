'use strict';

class ColorPickerPopup {
	static init() {
		const color = $.GetContextPanel().GetAttributeString('color', 'rgba(0,0,0,1)');
		$('#ColorPicker').prevColor = color;
		$('#ColorPicker').currColor = color;
	}

	static onSaveColor(color) {
		UiToolkitAPI.CloseThisPopup();
	}

	static onDiscardColor() {
		UiToolkitAPI.CloseThisPopup();
	}

	static {
		$.RegisterEventHandler('ColorPickerSave', $.GetContextPanel(), ColorPickerPopup.onSaveColor);
		$.RegisterEventHandler('ColorPickerCancel', $.GetContextPanel(), ColorPickerPopup.onDiscardColor);
	}
}
