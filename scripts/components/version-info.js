'use strict';

class VersionInfo {
	static {
		$.GetContextPanel().jsClass = this;
	}

	static update() {
		const cp = $.GetContextPanel();

		const graphics = VersionAPI.GetGraphicsAPI();
		const version = VersionAPI.GetVersion();
		const branch = VersionAPI.GetBranch();
		const platform = VersionAPI.GetPlatform();
		const physics = VersionAPI.GetPhysicsEngine();

		// Set the dialog variables so this can be used in label
		cp.SetDialogVariable('graphics', graphics);
		cp.SetDialogVariable('version', version);
		cp.SetDialogVariable('branch', branch);
		cp.SetDialogVariable('platform', platform);
		cp.SetDialogVariable('physics', physics);

		GameInterfaceAPI.GetSettingBool('developer') ? (cp.visible = true) : (cp.visible = false);

		if (VersionAPI.GetPhysicsEngine() !== 'Jolt') {
			cp.FindChild('PhysicsText').visible = false;
		}
	}
}
