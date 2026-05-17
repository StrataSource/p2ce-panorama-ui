'use strict';

class VersionInfo {
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

		cp.SetPanelEvent('onactivate', () => {
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/modals/popups/prerelease-warn-dialog.xml',
				'dosaKey=prereleaseAck&dosaNameToken=Dosa_PrereleaseAck&cancelAllowed=false'
			);
		});

		// update based on dev
		if (!GameInterfaceAPI.GetSettingBool('developer')) {
			for (const child of $('#TextContainer')!.Children()) {
				child.visible = child.id.length > 0;
			}

			const betaText = $<Label>('#BetaText')!;
			betaText.AddClass('VersionInfoText__Bigger');
			betaText.text = 'OPEN BETA';
			const ver = $<Label>('#VersionText')!;
			ver.text = version;
			ver.AddClass('VersionInfoText__NonDev');

			cp.AddClass('VersionInfo__AltPadding');

			cp.FindChildTraverse('Logo')!.RemoveClass('hide');
		}

		if (VersionAPI.GetPhysicsEngine() !== 'Jolt') {
			cp.FindChildTraverse('PhysicsText')!.visible = false;
		}
	}
}
