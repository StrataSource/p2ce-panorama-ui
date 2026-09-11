'use strict';

class MountAdder {
	static onLoad() {
		const groups = GameInterfaceAPI.GetSteamMountGroups();
		for (const group of groups) {
			if (group.active) continue;
			const p = $.CreatePanel('Button', $('#List')!, group.id);
			p.LoadLayoutSnippet('MountSnippet');

			p.FindChildTraverse('MountWarning')!.visible = !group.available;
			if (!group.available) {
				p.AddClass('add-mount__unavailable');
			}

			p.FindChildTraverse<Image>('MountCover')!.SetImage(`file://{images}/mounts/${group.id}.jpg`);

			let name = $.LocalizeSafe(`#MainMenu_Mounts_App_${group.id}`);
			if (name.length === 0)
				name = group.fallback_name;
			p.SetDialogVariable('name', name);

			const tag = $.LocalizeSafe(`#MainMenu_Mounts_App_Subtag_${group.id}`);
			if (tag.length > 0) {
				p.SetDialogVariable('tag', tag);
			} else {

			}

			p.SetPanelEvent('onactivate', () => {
				GameInterfaceAPI.SetSteamMountGroupActive(group.id, true);
			});
		}
	}
}
