'use strict';

class PlayMenu {
	static model1 = $<ModelPanel>('#PlayerModel1')!;
	//static model2 = $<ModelPanel>('#PlayerModel2')!;
	//static model3 = $<ModelPanel>('#PlayerModel3')!;

	static setupModelPanel(panel: ModelPanel) {
		panel.LookAtModel();
		panel.SetCameraOffset(-150, 0, 0);
		panel.SetCameraFOV(25);
		panel.SetModelRotation(0, 220, 0);
		panel.SetModelRotationSpeedTarget(0, 0.05, 0);
		panel.SetMouseXRotationScale(0, 1, 0); // By default mouse X will rotate the X axis, but we want it to spin Y axis
		panel.SetMouseYRotationScale(0, 0, 0); // Disable mouse Y movement rotations
		panel.SetLightAmbient(0.2921, 0.327, 0.43);
		panel.SetDirectionalLightColor(1, 1.076, 1.2, 1.282);
		panel.SetDirectionalLightColor(0, 0.538, 0.6, 0.641);
		panel.SetDirectionalLightDirection(1, -50, 270, 0);
		panel.SetDirectionalLightDirection(0, -50, 135, 0);
	}

	static setPlayerMenuLines() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('#MainMenu_Navigation_Play'),
			$.Localize('#MainMenu_Navigation_Play_Modes')
		);

		this.setupModelPanel(this.model1);
		//this.setupModelPanel(this.model2);
		//this.setupModelPanel(this.model3);
		//this.model1.AddClass("");
	}

	static onSinglePlayerBtnPressed() {
		$.DispatchEvent(
			'MainMenuOpenNestedPage',
			'SinglePlayer',
			'main-menu/play/singleplayer/content-selector-sp',
			undefined
		);
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_PLAYERCOUNT_TYPE] = false;
	}

	static onMultiPlayerBtnPressed() {
		$.DispatchEvent(
			'MainMenuOpenNestedPage',
			'MultiPlayer',
			'main-menu/play/multiplayer/content-selector-mp',
			undefined
		);
		UiToolkitAPI.GetGlobalObject()[GlobalUiObjects.UI_PLAYERCOUNT_TYPE] = true;
	}
}
