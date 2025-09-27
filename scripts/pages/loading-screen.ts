'use strict';

class LoadingScreenController {
	static lastLoadedMapName = '';

	static progressBar = $('#ProgressBar') as ProgressBar;
	static bgImage1 = $('#BackgroundMapImage1') as Image;
	static bgImage2 = $('#BackgroundMapImage2') as Image;

	static portal2CampaignA1Maps = [
		'sp_a1_intro1',
		'sp_a1_intro2',
		'sp_a1_intro3',
		'sp_a1_intro4',
		'sp_a1_intro5',
		'sp_a1_intro6',
		'sp_a1_intro7',
		'sp_a1_wakeup',
		'sp_a2_intro'
	];

	static portal2CampaignA2Maps = [
		'sp_a2_bridge_intro',
		'sp_a2_bridge_the_gap',
		'sp_a2_bts1',
		'sp_a2_bts2',
		'sp_a2_bts3',
		'sp_a2_bts4',
		'sp_a2_bts5',
		'sp_a2_bts6',
		'sp_a2_catapult_intro',
		'sp_a2_column_blocker',
		'sp_a2_core',
		'sp_a2_dual_lasers',
		'sp_a2_fizzler_intro',
		'sp_a2_laser_chaining',
		'sp_a2_laser_intro',
		'sp_a2_laser_over_goo',
		'sp_a2_laser_relays',
		'sp_a2_laser_stairs',
		'sp_a2_laser_vs_turret',
		'sp_a2_pit_flings',
		'sp_a2_pull_the_rug',
		'sp_a2_ricochet',
		'sp_a2_sphere_peek',
		'sp_a2_triple_laser',
		'sp_a2_trust_fling',
		'sp_a2_turret_blocker',
		'sp_a2_turret_intro',
		'sp_a3_00',
		'sp_a3_01'
	];

	static portal2CampaignA3Part1Maps = [
		'sp_a3_03',
		'sp_a3_jump_intro',
		'sp_a3_bomb_flings',
		'sp_a3_crazy_box',
		'sp_a3_transition01'
	];

	static portal2CampaignA3Part2Maps = ['sp_a3_speed_ramp', 'sp_a3_speed_flings'];

	static portal2CampaignA3OutroMaps = ['sp_a3_portal_intro', 'sp_a3_end'];

	static portal2CampaignA4Maps = [
		'sp_a4_intro',
		'sp_a4_tb_intro',
		'sp_a4_tb_trust_drop',
		'sp_a4_tb_wall_button',
		'sp_a4_tb_polarity',
		'sp_a4_tb_catch',
		'sp_a4_stop_the_box',
		'sp_a4_laser_catapult',
		'sp_a4_laser_platform',
		'sp_a4_speed_tb_catch',
		'sp_a4_jump_polarity',
		'sp_a4_finale1',
		'sp_a4_finale2',
		'sp_a4_finale3',
		'sp_a4_finale4'
	];

	static portal2CampaignA5Maps = ['sp_a5_credits'];

	static portal2SXCampaignA1Maps = [
		'sp_a1_sx_perc_tutorial',
		'sp_a1_sx_perc_tutorial_2',
		'sp_a1_sx_perc_surfing',
		'sp_a1_sx_perc_scaling',
		'sp_a1_sx_perc_stations',
		'sp_a1_sx_perc_portaling',
		'sp_a1_sx_perc_paint'
	];

	static portal2SXCampaignA2Maps = ['sp_a2_sx_intro', 'sp_a2_sx_reaching'];

	static portal2SXCampaignA3Maps = ['sp_a3_sx_intro', 'sp_a3_sx_shield'];

	static portal2SXCampaignA4Maps = ['sp_a4_sx_intro', 'sp_a4_sx_thru_portals'];

	static portal2SXCampaignA5Maps = ['sp_a5_sx_final'];

	static portal2SXCampaignA6Maps = ['sp_a6_sx_intro', 'sp_a6_sx_lasers'];

	static portal2SXCampaignA7Maps = ['sp_a7_sx_gel', 'sp_a7_sx_paint'];

	static portal2SXCampaignA8Maps = [
		'sp_a8_sx_turrets',
		'sp_a8_sx_gdc', // CES 2011 demo
		'sp_a8_sx_tb_surf'
	];

	static init() {
		this.progressBar.value = 0;

		this.bgImage1.RemoveClass('loadingscreen__backgroundhideanim');
		this.bgImage2.RemoveClass('loadingscreen__backgroundhideanim');

		this.bgImage2.visible = false;
	}

	static updateLoadingScreenInfoRepeater() {
		// Progress bar will be 1.0 when loading finishes and is then reset to 0.0
		if (this.bgImage2.visible) return;

		if (this.progressBar.value >= 0.25) {
			this.bgImage1.AddClass('loadingscreen__backgroundhideanim');
			this.bgImage2.visible = true;
			return;
		}

		// Rechecking every 8th of a second is OK, it doesn't need to be anything crazy
		$.Schedule(0.125, this.updateLoadingScreenInfoRepeater.bind(this));
	}

	static updateLoadingScreenInfo(mapName: string) {
		const getMapImage = (map: string, number: number) => {
			const base = 'file://{materials}/vgui/loading_screens/loadingscreen_';
			const sxBase = 'file://{materials}/vgui/loading_screens/sixense_loadingscreen_';

			// The Super 8 teaser has a special background image. Force it to "e1912_1".
			if (map.startsWith('e1912')) return base + 'e1912_1_widescreen.vtf';
			// Pivot: Account for Sixense maps in appids 660 and 247120... We already have a dedicated array for A5 maps set up, so maybe a match for sp_aX_sx would work?
			// These only have one dedicated loading screen background image, so force "aX_1_widescreen.vtf".
			else if (map.startsWith('sp_a1_sx')) return sxBase + 'a1_1_widescreen.vtf';
			else if (map.startsWith('sp_a2_sx')) return sxBase + 'a2_1_widescreen.vtf';
			else if (map.startsWith('sp_a3_sx')) return sxBase + 'a3_1_widescreen.vtf';
			else if (map.startsWith('sp_a4_sx')) return sxBase + 'a4_1_widescreen.vtf';
			else if (map.startsWith('sp_a5_sx')) return sxBase + 'a5_1_widescreen.vtf';
			else if (map.startsWith('sp_a6_sx') || map.startsWith('sp_a7_sx') || map.startsWith('sp_a8_sx'))
				return sxBase + 'a6_1_widescreen.vtf';
			// Standard Portal 2 SP maps.
			else if (map.startsWith('sp_a1')) return base + 'a1_' + number + '_widescreen.vtf';
			else if (map.startsWith('sp_a2')) return base + 'a2_' + number + '_widescreen.vtf';
			else if (map.startsWith('sp_a3')) return base + 'a3_' + number + '_widescreen.vtf';
			else if (map.startsWith('sp_a4')) return base + 'a4_' + number + '_widescreen.vtf';
			// Pivot: Portal 2 VGUI behavior for "act 5" maps is to always resort to default Wheatley Laboratories BG as a placeholder.
			//        Act 5 by itself is not real; it's a placeholder for the sp_30_a4_finale5 and callback biks that play at the very end
			//        of finale4, which forcibly overrides the default basemodui background video to Act 5 as soon as the game ends via
			//        a hacky workaround involving a point_clientcommand entity that toggles on hidden ConVar cl_finale_completed.
			else if (map.startsWith('sp_a5')) return base + 'default_e_' + number + '_widescreen.vtf';
			// Coop is its own thing. We randomize the images later on.
			else if (map.startsWith('mp')) return base + 'coop_' + number + '_widescreen.vtf';
			// if map is empty, we are reloading the current map
			// todo: the aperture logo loading screens don't map exactly to the acts,
			//       act 3 in particular has two different aperture logo loading screens.
			//       fixing this will probably involve making a variable storing every
			//       map name in the game to map it to the right loading screen.
			//       in the meantime, this looks pretty good
			else if (this.portal2CampaignA1Maps.includes(this.lastLoadedMapName))
				return base + 'default_a_' + number + '_widescreen.vtf';
			else if (this.portal2CampaignA2Maps.includes(this.lastLoadedMapName))
				return base + 'default_b_' + number + '_widescreen.vtf';
			else if (this.portal2CampaignA3Part1Maps.includes(this.lastLoadedMapName))
				return base + 'default_c_' + number + '_widescreen.vtf';
			else if (this.portal2CampaignA3Part2Maps.includes(this.lastLoadedMapName))
				return base + 'default_d_' + number + '_widescreen.vtf';
			else if (this.portal2CampaignA3OutroMaps.includes(this.lastLoadedMapName))
				return base + 'default_b_' + number + '_widescreen.vtf';
			else if (this.portal2CampaignA4Maps.includes(this.lastLoadedMapName))
				return base + 'default_e_' + number + '_widescreen.vtf';
			else if (this.portal2CampaignA5Maps.includes(this.lastLoadedMapName))
				return base + 'default_e_' + number + '_widescreen.vtf'; // Pivot: See above.
			// If not part of any inbox portal2 map, don't do anything.
			else return base + 'default_b_' + number + '_widescreen.vtf';
		};

		if (mapName.length > 0) this.lastLoadedMapName = mapName;

		let imageNumber1, imageNumber2;

		// If we're in coop, randomize.
		if (mapName.startsWith('mp')) {
			imageNumber1 = Math.floor(Math.random() * 3) + 1;
			imageNumber2 = imageNumber1 + 1;
		} else {
			imageNumber1 = 1;
			imageNumber2 = 4;
		}

		this.bgImage1.SetImage(getMapImage(mapName, imageNumber1));
		this.bgImage1.visible = true;
		this.bgImage2.SetImage(getMapImage(mapName, imageNumber2));

		$.Schedule(0.125, this.updateLoadingScreenInfoRepeater.bind(this));
	}

	static {
		$.RegisterForUnhandledEvent('UnloadLoadingScreenAndReinit', this.init.bind(this));
		$.RegisterForUnhandledEvent('PopulateLoadingScreen', this.updateLoadingScreenInfo.bind(this));
	}
}
