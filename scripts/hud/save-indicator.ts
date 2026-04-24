'use strict';

class SaveIndicator {
	static fadeTimer: uuid | undefined = undefined;
	static isAutoSave: boolean = false;

	static {
		$.RegisterForUnhandledEvent('GameSaved', this.onSaveStarted.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', this.hide.bind(this));
		$.RegisterForUnhandledEvent('LevelInitPostEntity', this.hide.bind(this));
	}

	static onSaveStarted(save_name: string, save_type: SaveType) {
		if (!GameInterfaceAPI.GetSettingBool("save_hud")) return;

		if (save_type == SaveType.Autosave) {
			if (!GameInterfaceAPI.GetSettingBool("save_hud_autosave")) return;
			this.isAutoSave = true;
		} else {
			this.isAutoSave = false;
		}

		const label = $.GetContextPanel().FindChildInLayoutFile<Label>('StatusLabel');
		label?.SetLocalizationString(this.isAutoSave ? "#PORTAL2_Hud_AutoSavingGame" : "#PORTAL2_Hud_SavingGame");

		this.show();
		this.fadeOutTimer();
		
	}

	static show() {
		$.GetContextPanel().style.animation = 'FadeIn 0.01s ease-out 0s 1 normal forwards';
	}

	static hide() {
		$.GetContextPanel().style.animation = 'FadeOut 0.01s ease-out 0s 1 normal forwards';
		const kfs = $.GetContextPanel().CreateCopyOfCSSKeyframes('FadeOut');
		$.GetContextPanel().UpdateCurrentAnimationKeyframes(kfs);
	}

	static fadeOutTimer() {
		if (this.fadeTimer !== undefined) $.CancelScheduled(this.fadeTimer);
		this.fadeTimer = $.Schedule(1, () => {
			// Update the text label to say "saved"
			const label = $.GetContextPanel().FindChildInLayoutFile<Label>('StatusLabel');
			label?.SetLocalizationString(this.isAutoSave ? "#PORTAL2_Hud_GameAutoSaved" : "#PORTAL2_Hud_GameSaved");

			$.GetContextPanel().style.animation = 'FadeOut 1s ease-out 0s 1 normal forwards';
			const kfs = $.GetContextPanel().CreateCopyOfCSSKeyframes('FadeOut');
			$.GetContextPanel().UpdateCurrentAnimationKeyframes(kfs);
			this.fadeTimer = undefined;
		});
	}
}