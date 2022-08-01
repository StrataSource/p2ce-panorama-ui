"use strict";

// eslint-disable-next-line no-unused-vars
class LoadingScreenController {
	static lastLoadedMapName = "";

	static init() {
		$("#ProgressBar").value = 0;
		$.GetContextPanel()
			.FindChildInLayoutFile("BackgroundMapImage1")
			.RemoveClass("loading-screen-backgroundhideanim");
		$.GetContextPanel().FindChildInLayoutFile("BackgroundMapImage2").visible = false;
	}

	static updateLoadingScreenInfoRepeater() {
		// Progress bar will be 1.0 when loading finishes and is then reset to 0.0
		if ($.GetContextPanel().FindChildInLayoutFile("BackgroundMapImage2").visible) return;

		if ($("#ProgressBar").value > 0.35) {
			$.GetContextPanel()
				.FindChildInLayoutFile("BackgroundMapImage1")
				.AddClass("loading-screen-backgroundhideanim");
			$.GetContextPanel().FindChildInLayoutFile("BackgroundMapImage2").visible = true;
			return;
		}

		// Rechecking every 8th of a second is OK, it doesn't need to be anything crazy
		$.Schedule(0.125, LoadingScreenController.updateLoadingScreenInfoRepeater);
	}

	static updateLoadingScreenInfo(mapName) {
		function getMapImage(map, number) {
			const base = "file://{materials}/vgui/loading_screens/loadingscreen_";
			if (map.startsWith("e1912")) return base + "e1912_1_widescreen.vtf";
			else if (map.startsWith("sp_a1")) return base + "a1_" + number + "_widescreen.vtf";
			else if (map.startsWith("sp_a2")) return base + "a2_" + number + "_widescreen.vtf";
			else if (map.startsWith("sp_a3")) return base + "a3_" + number + "_widescreen.vtf";
			else if (map.startsWith("sp_a4")) return base + "a4_" + number + "_widescreen.vtf";
			else if (map.startsWith("sp_a5")) return base + "a5_1_widescreen.vtf";
			else if (map.startsWith("mp")) return base + "coop_" + number + "_widescreen.vtf";
			// if map is empty, we are reloading the current map
			// todo: the aperture logo loading screens don't map exactly to the acts,
			//       act 3 in particular has two aperture logo loading screens.
			//       fixing this will probably involve making a variable storing every
			//       map name in the game to map it to the right loading screen.
			//       in the meantime, this looks pretty good
			else if (LoadingScreenController.lastLoadedMapName.startsWith("sp_a1"))
				return base + "default_a_" + number + "_widescreen.vtf";
			else if (LoadingScreenController.lastLoadedMapName.startsWith("sp_a2"))
				return base + "default_b_" + number + "_widescreen.vtf";
			else if (LoadingScreenController.lastLoadedMapName.startsWith("sp_a3"))
				return base + "default_c_" + number + "_widescreen.vtf";
			else if (LoadingScreenController.lastLoadedMapName.startsWith("sp_a4"))
				return base + "default_e_" + number + "_widescreen.vtf";
			else if (LoadingScreenController.lastLoadedMapName.startsWith("sp_a5")) return base + "a5_1_widescreen.vtf";
			else return base + "default_b_" + number + "_widescreen.vtf";
		}

		if (mapName.length > 0) LoadingScreenController.lastLoadedMapName = mapName;

		let imageNumber1, imageNumber2;
		if (mapName.startsWith("mp")) {
			imageNumber1 = Math.floor(Math.random() * 3) + 1;
			imageNumber2 = imageNumber1 + 1;
		} else {
			imageNumber1 = 1;
			imageNumber2 = 4;
		}

		const bgImage1 = $.GetContextPanel().FindChildInLayoutFile("BackgroundMapImage1");
		bgImage1.SetImage(getMapImage(mapName, imageNumber1));
		bgImage1.visible = true;
		$.GetContextPanel().FindChildInLayoutFile("BackgroundMapImage2").SetImage(getMapImage(mapName, imageNumber2));

		$.Schedule(0.125, LoadingScreenController.updateLoadingScreenInfoRepeater);
	}

	static {
		$.RegisterForUnhandledEvent("UnloadLoadingScreenAndReinit", LoadingScreenController.init);
		$.RegisterForUnhandledEvent("PopulateLoadingScreen", LoadingScreenController.updateLoadingScreenInfo);
	}
}
