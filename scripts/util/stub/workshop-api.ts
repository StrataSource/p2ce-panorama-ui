interface AddonMeta {
	index: number;
	title: string;
	description: string;
	local: boolean;

	authors: string[];
	tags: string[];

	dependencies: {[uuid: string]: { required: boolean }};
	subscriptions: number;
	votescore: number;
	flagged: boolean;

	cover: string;
	logo: string;
}

interface AddonMapMeta {
	map: string;
	title: string;
	description: string;

	unlocked: boolean;
	thumb: string;
	background: string;
}

type DownloadState = ValueOf<typeof DownloadState>;
const DownloadState = {
	UninstallPending: 0,
	Uninstalling:     1,
	Uninstalled:      2,

	InstallPending:   3,
	Installing:       4,
	Installed:        5,
} as const;

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
		$.Msg(this.sauce);
		return Object.keys(this.sauce).length;
	}

	static GetAddonMeta(index: number): AddonMeta {
		$.Msg(this.sauce)
		return this.sauce[index];
	}

	static GetAddonMaps(index: number): AddonMapMeta[] {
		return [{
			map: 'sp_a1_intro1',
			description: 'Chapter 1',
			title: 'The Wakeup Call',
			thumb: 'file://{workshop}/id-placeholder/images/card.jpeg',
			background: 'file://{workshop}/id-placeholder/images/card.jpeg',
			unlocked: true
		}, {
			map: 'sp_a1_intro2',
			description: 'Chapter 2',
			title: 'The Sleepy Call',
			thumb: 'file://{workshop}/id-placeholder/images/card.jpeg',
			background: 'file://{workshop}/id-placeholder/images/card.jpeg',
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
}