interface AddonMeta {
	uuid: string|null;
	name: string;
	desc: string;

	authors: string[];
	tags: string[];

	dependencies: {[uuid: string]: { required: boolean }};
	subscriptions: number;
	votescore: number;
	flagged: boolean;

	icon_small: string;
	icon_big: string;
}

enum DownloadState {
	UninstallPending,
	Uninstalling,
	Uninstalled,

	InstallPending,
	Installing,
	Installed,
}


class WorkshopAPI {
	static __en__ = true;

	static GetAddonCount(): number {
		return 1;
	}

	static GetAddonMeta(index: number): AddonMeta {
		return {
			uuid: '2b37a65e12d4561f',
			name: 'Among Us in Portal 2',
			desc: 'Holy shit guys, it\'s Among Us in Portal 2 by Valve Software!',

			authors: [ 'Baguettery' ],
			tags: [ 'Among Us' ],

			dependencies: {},
			subscriptions: 234,
			votescore: 102,
			flagged: false,

			icon_small: 'file://{workshop_content}/2b37a65e12d4561f/small.png',
			icon_big: 'file://{workshop_content}/2b37a65e12d4561f/small.png',
		}
	}

	static GetAddonState(uuid: string): DownloadState {
		return DownloadState.Installed;
	}

	static GetAddonSubscribed(uuid: string): boolean {
		return true;
	}

	static GetAddonEnabled(uuid: string): boolean {
		return this.__en__;
	}

	static SetAddonSubscribed(uuid: string, subscribed: boolean): boolean {
		return true;
	}

	static SetAddonEnabled(uuid: string, enabled: boolean): boolean {
		this.__en__ = enabled;
		return true;
	}
}