
namespace WorkshopAPI {
	let __en__: boolean = true;

	export function GetAddonCount(): number {
		return 2;
	}

	export function GetAddonMeta(index: number): AddonMeta {
		const l = 
		[
			{
				uuid: '1636452068648517094',
				name: 'double decker',
				desc: 'Holy shit guys, it\'s Among Us in Portal 2 by Valve Software!',
				
				filename: "sp_a2_double_decker_laser",

				authors: [ 'Baguettery' ],
				tags: [ 'Among Us' ],

				dependencies: {},
				subscriptions: 234,
				votescore: 102,
				flagged: false,

				icon_small: 'file://{materials}/vgui/backgrounds/background01.vtf',
				icon_big: 'file://{materials}/vgui/backgrounds/background01.vtf',
			},
			{
				uuid: '1834678435856326332',
				name: 'pit flings',
				desc: 'Holy shit guys, it\'s Among Us in Portal 2 by Valve Software!',
				
				filename: "sp_a2_pit_flings_p2ce",

				authors: [ 'Baguettery' ],
				tags: [ 'Among Us' ],

				dependencies: {},
				subscriptions: 234,
				votescore: 102,
				flagged: false,

				icon_small: 'file://{materials}/vgui/backgrounds/background01.vtf',
				icon_big: 'file://{materials}/vgui/backgrounds/background01.vtf',
			},
			
		];
		return l[index];
	}

	export function GetAddonState(uuid: string): DownloadState {
		return 1;
	}

	export function GetAddonSubscribed(uuid: string): boolean {
		return true;
	}

	export function GetAddonEnabled(uuid: string): boolean {
		return __en__;
	}

	export function SetAddonSubscribed(uuid: string, subscribed: boolean): boolean {
		return true;
	}

	export function SetAddonEnabled(uuid: string, enabled: boolean): boolean {
		__en__ = enabled;
		return true;
	}
}
