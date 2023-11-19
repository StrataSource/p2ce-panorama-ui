interface AddonMeta {
	uuid: uuid|null;
	title: string;
	description: string;

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
	static __en__ = true;

	static GetAddonCount(): number {
		return 1;
	}

	static GetAddonMeta(index: number): AddonMeta {
		return {
			uuid: 123686234876,
			title: 'Among Us in Portal 2',
			description: 'Holy shit guys, it\'s Among Us in Portal 2 by Valve Software!',

			authors: [ 'Baguettery' ],
			tags: [ 'Among Us' ],

			dependencies: {},
			subscriptions: 234,
			votescore: 102,
			flagged: false,

			cover: 'file://{workshop}/id-placeholder/images/card.jpeg',
			// background: 'file://{workshop_content}/2b37a65e12d4561f/small.png',
			logo: 'file://{amogus}',
		}
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
		return this.__en__;
	}

	static SetAddonSubscribed(index: number, subscribed: boolean): boolean {
		return true;
	}

	static SetAddonEnabled(index: number, enabled: boolean): boolean {
		this.__en__ = enabled;
		return true;
	}
}