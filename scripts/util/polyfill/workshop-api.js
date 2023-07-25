
const DownloadState = {
	UninstallPending: 0,
	Uninstalling: 1,
	Uninstalled: 2,

	InstallPending: 3,
	Installing: 4,
	Installed: 5,
};

if (!globalThis['WorkshopAPI']) {

	/** @implements {WorkshopAPI} */
	globalThis.WorkshopAPI = class {
		/** @type {{[key: string]: AddonMeta}} */
		static __addons__ = {
			'2b37a65e12d4561f': {
				__state__: DownloadState.Installed,
				__enabled__: true,
				uuid: '2b37a65e12d4561f',
				name: 'Among Us in Portal 2',
				desc: 'Holy shit guys, it\'s Among Us in Portal 2 by Valve Software!',

				authors: [ 'Baguettery' ],
				tags: [ 'Among Us' ],
				
				dependencies: {},
				subscriptions: 234,
				votescore: 102,
				
				icon_small: 'file://{workshop_content}/2b37a65e12d4561f/small.png',
				icon_big: 'file://{workshop_content}/2b37a65e12d4561f/small.png',
			}
		}

		static SetAddonEnabled(uuid, enabled) { this.__addons__[uuid].__enabled__ = enabled };
		static SetAddonSubscribed(uuid, subscribed) {
			const addon = this.__addons__[uuid];
			const currently_subbed = addon.__state__ >= 3;
			if (currently_subbed === subscribed) return;

			const new_state = subscribed ? DownloadState.InstallPending : Download.UninstallPending;
			$.DispatchEvent('WorkshopDownloadStatus', uuid, new_state);
			$.Schedule(1, () => {

				const next_state = subscribed ? DownloadState.Installing : Download.Uninstalling;
				$.Schedule(1, () => {

					const final_state = subscribed ? DownloadState.Installed : Download.Uninstalled;
				});
			});
		};
	}
}