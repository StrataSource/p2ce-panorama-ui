'use strict';

class SettingsShared {
	static videoSettingsPanel: GenericPanel | null = null;

	static onChangedTab(newTab: string) {
		switch (newTab) {
			case 'VideoSettings': {
				this.videoSettingsPanel ??= $('#VideoSettings');

				// Get the apply and discard buttons on the video settings screen
				const applyVideoSettingsButton =
					this.videoSettingsPanel!.FindChildInLayoutFile('ApplyVideoSettingsButton');
				const discardVideoSettingsButton =
					this.videoSettingsPanel!.FindChildInLayoutFile('DiscardVideoSettingsButton');

				// disabled as no user changes yet
				applyVideoSettingsButton!.enabled = false;
				discardVideoSettingsButton!.enabled = false;

				// Tell C++ to init controls from convars
				$.DispatchEvent('VideoSettingsInit');

				break;
			}
			// No default
		}

		const newTabPanel = $.GetContextPanel().FindChildInLayoutFile(newTab);
		this.refreshControlsRecursive(newTabPanel);
	}

	static refreshControlsRecursive(panel: GenericPanel | null) {
		if (panel === null) return;

		const type = panel.paneltype;
		if (
			type === 'SettingsSlider' ||
			type === 'SettingsKeyBinder' ||
			type === 'SettingsToggle' ||
			type === 'SettingsEnumDropDown'
		) {
			panel.OnShow();
		}

		for (const child of panel.Children() || []) this.refreshControlsRecursive(child);
	}

	/*
	TODO
	static getResetString(panel: GenericPanel | null) {
		if (!panel) {
			return '';
		}

		const type = panel.paneltype;
		let string = '';
		
		if (type === 'SettingsSlider' ||
			type === 'SettingsEnumDropDown' ||
			type === 'ConVarColorDisplay' ||
			type === 'SettingsEnum'
		) {
			WIP API, DOESNT EXIST IN PROD
			const def = GameInterfaceAPI.GetSettingDefault(panel.convar);
			string += `\n${panel.convar}${def ? ` -> ${def}` : ''}`;
		} else if (panel.paneltype === 'SettingsKeyBinder') {
			//
		} else {
			for (const child of panel.Children() || []) string += `${this.getResetString(child)}`;
		}
		
		return string;
	}
	*/

	static resetSettingsRecursive(panel: GenericPanel | null) {
		if (!panel) {
			return;
		}

		if (
			panel.paneltype === 'SettingsSlider' ||
			panel.paneltype === 'SettingsEnumDropDown' ||
			panel.paneltype === 'ConVarColorDisplay' /* ||
			panel.paneltype === 'SettingsEnum' */
		) {
			panel.RestoreCVarDefault();
		} else if (panel.paneltype === 'SettingsKeyBinder') {
			// OptionsMenuAPI has already handled this, just refresh
			panel.OnShow();
		} else {
			for (const child of panel?.Children() || []) this.resetSettingsRecursive(child);
		}
	}

	static resetControls(panelID: string) {
		this.showConfirmResetSettings($.Localize('#Settings_Reset_Message_Generic'), () => {
			OptionsMenuAPI.RestoreKeybdMouseBindingDefaults();
			this.resetSettingsRecursive($.GetContextPanel().FindChildTraverse(panelID));
		});
	}

	static resetSettings(panelID: string) {
		//const previewStr = `${$.Localize('#Settings_Reset_Message')}\n${this.getResetString($.GetContextPanel().FindChildTraverse(panelID))}`;
		this.showConfirmResetSettings($.Localize('#Settings_Reset_Message_Generic'), () => {
			this.resetSettingsRecursive($.GetContextPanel().FindChildTraverse(panelID));
		});
	}

	static resetVideoSettings() {
		// For future: use same localisation string as above
		this.showConfirmResetSettings($.Localize('#Settings_Reset_Message_Generic'), () => {
			$.DispatchEvent('VideoSettingsResetDefault');
			this.resetSettingsRecursive($.GetContextPanel());
			this.videoSettingsOnUserInputSubmit();
		});
	}

	static showConfirmResetSettings(message: string, resetFn: Func) {
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle(
			$.Localize('#Settings_Reset_Title'),
			message,
			'warning-popup',
			$.Localize('#Action_Yes'),
			resetFn,
			$.Localize('#Action_Cancel'),
			() => {},
			'dim'
		);
	}

	// State logic to tracking if there are changes to apply or discard:
	// Changes in panel controls -> enable both
	// Reset button pressed -> enable both
	// Apply button pressed -> disable both
	// Discard button pressed -> disable both

	static videoSettingsOnUserInputSubmit() {
		$('#ApplyVideoSettingsButton')!.enabled = true;
		$('#DiscardVideoSettingsButton')!.enabled = true;
	}

	static videoSettingsResetUserInput() {
		$('#ApplyVideoSettingsButton')!.enabled = false;
		$('#DiscardVideoSettingsButton')!.enabled = false;
	}

	static videoSettingsDiscardChanges() {
		// Discard dialogue seems unnecessary here
		// this.showConfirmResetSettings('Are you sure you want to discard your changes to video settings?', () => {
		$.DispatchEvent('VideoSettingsInit');
		this.videoSettingsResetUserInput();
		// });
	}

	static videoSettingsApplyChanges() {
		$.DispatchEvent('ApplyVideoSettings');
		this.videoSettingsResetUserInput();
	}

	static isSettingsPanel(panel: GenericPanel) {
		return [
			'SettingsEnum',
			'SettingsSlider',
			'SettingsEnumDropDown',
			'SettingsKeyBinder',
			'SettingsToggle',
			'ConVarColorDisplay'
		].includes(panel.paneltype);
	}

	static sentryUpdateConsent() {
		// Don't even bother asking if sentry isn't enabled
		if (!SentryAPI.IsSentryActive()) {
			return;
		}

		UiToolkitAPI.ShowGenericPopupYesNo(
			'Sentry Consent',
			'Allow automatic upload of crash dumps?' +
				'\n\nCrash dumps contain game path information and the SteamID of the currently logged in Steam account.',
			'wide-popup',
			() => {
				GameInterfaceAPI.ConsoleCommand('sentry_consent_give');
			},
			() => {
				GameInterfaceAPI.ConsoleCommand('sentry_consent_revoke');
			}
		);
	}

	static PlayTestDosaRemove() {
		DosaHandler.removeDosa('playtestConsent');
	}
}
