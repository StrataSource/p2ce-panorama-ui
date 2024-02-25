
// @ts-expect-error amogus
const DownloadState: DownloadStateEnum = {
	UninstallPending: 0,
	Uninstalling: 1,
	Uninstalled: 2,
	InstallPending: 3,
	Installing: 4,
	Installed: 5
}

class WorkshopAPI {
	static sauce = $.LoadKeyValuesFile('panorama/workshop/builtins.vdf') as {
		[key: string]: AddonMeta
	};

	static {
		for (const key in this.sauce) {
			this.sauce[key].authors = (<string><unknown>this.sauce[key].authors).split(',');
			this.sauce[key].local = <string><unknown>this.sauce[key].local !== 'false';
		}
	}

	static GetAddonCount(): number {
		return Object.keys(this.sauce).length;
	}

	static GetAddonMeta(index: number): AddonMeta {
		return this.sauce[index];
	}

	static GetAddonChapters(index: number): AddonChapterMeta[] {
		return [{
			map: 'sp_a1_intro1',
			description: 'Chapter 1',
			title: 'The Wakeup Call',
			thumb: 'file://{workshop}/p2/images/620_library_hero.jpg',
			background: 'file://{workshop}/p2/images/620_library_hero.jpg',
			unlocked: true
		}, {
			map: 'sp_a1_intro2',
			description: 'Chapter 2',
			title: 'The Sleepy Call',
			thumb: 'file://{workshop}/p2ce/images/440000_hero.jpg',
			background: 'file://{workshop}/p2ce/images/440000_hero.jpg',
			unlocked: true
		}];
	}

	static GetAddonState(index: number): DownloadState {
		return DownloadState.Installed;
	}

	static GetAddonSubscribed(index: number): boolean {
		return true;
	}

	static GetAddonEnabled(index: number): boolean {
		return true;
	}

	static SetAddonSubscribed(index: number, subscribed: boolean): boolean {
		return true;
	}

	static SetAddonEnabled(index: number, enabled: boolean): boolean {
		return true;
	}

	static GetAddonByMap(map: string): uuid {
		return +(map !== 'sp_a1_intro1');
	}
}