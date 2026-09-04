'use strict';

class CosmeticsMenu {

	static selectedModel: ModelPanel;
    static model1: ModelPanel = $<ModelPanel>('#PlayerModel1')!;
    static model2: ModelPanel = $<ModelPanel>('#PlayerModel2')!;
    static model3: ModelPanel = $<ModelPanel>('#PlayerModel3')!;

	static setupModelPanel(panel: ModelPanel) {
		panel.LookAtModel();
		panel.SetCameraOffset(-150, 0, 0);
		panel.SetCameraFOV(25);
		panel.SetModelRotation(0, 220, 0);
		//panel.SetModelRotationSpeedTarget(0, 0.05, 0);
		panel.SetMouseXRotationScale(0, 1, 0); // By default mouse X will rotate the X axis, but we want it to spin Y axis
		panel.SetMouseYRotationScale(0, 0, 0); // Disable mouse Y movement rotations
		panel.SetLightAmbient(0.2921, 0.327, 0.43);
		panel.SetDirectionalLightColor(1, 1.076, 1.2, 1.282);
		panel.SetDirectionalLightColor(0, 0.538, 0.6, 0.641);
		panel.SetDirectionalLightDirection(1, -50, 270, 0);
		panel.SetDirectionalLightDirection(0, -50, 135, 0);
    }

    static onLoad() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			$.Localize('[HC] Cosmetics Menu'),
			$.Localize('[HC] No This Is Not Me Doing A Over Scope. This Is For Funnsies! I Promise!')
		);

		this.selectedModel = this.model1;
		this.setupModelPanel(this.model1);
		this.setupModelPanel(this.model2);
		this.setupModelPanel(this.model3);
	}

	static selectModel(index: number) {
		switch (index) {
			case 1:
				this.selectedModel = this.model2;
				break;
			case 2:
				this.selectedModel = this.model3;
				break;
			case 0:
			default:
				this.selectedModel = this.model1;
				break;
		}
	}

	static 
}
