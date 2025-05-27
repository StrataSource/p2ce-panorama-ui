

// @ts-expect-error
if (!WorkshopAPI._override) {

	// const W_addonCount = WorkshopAPI.GetAddonCount.bind(globalThis);
	// const W_addonMeta = WorkshopAPI.GetAddonMeta;
	// const W_getAddonByMap = WorkshopAPI.GetAddonByMap;
	// const W_getAddonChapters = WorkshopAPI.GetAddonChapters;
	
	// @ts-expect-error
	WorkshopAPI._override = true;
	
	const p2_addon: AddonMeta = {
		type: "campaign",
		index: WorkshopAPI.GetAddonCount(),
		title: "Portal 2",
		description: "The original campaign",
		workshopid: 0,
		local: true,
		authors: ["Valve"],
		tags: [],
		dependencies: {},
		subscriptions: 0,
		votescore: 0,
		flagged: false,
		thumb: "",
	
		cover: "file://{images}/temp/peter.png"
	};
	
	const p2_chapters: AddonChapterMeta[] = [
		{
			map: "sp_a1_intro1",
			title: "Intro 1",
			description: "peter 1",
			unlocked: true,
			thumb: "file://{images}/temp/peter.png",
			background: "file://{images}/temp/peter.png"
		},
		{
			map: "sp_a2_triple_laser",
			title: "Triple Laser",
			description: "peter 2",
			unlocked: true,
			thumb: "file://{images}/temp/peter.png",
			background: "file://{images}/temp/peter.png"
		},
	];
	
	WorkshopAPI.GetAddonCount = () => {
		return 4;
	}
	
	WorkshopAPI.GetAddonByMap = (mapname) => {
		for (const chapter of p2_chapters) {
			if (chapter.map == mapname) return p2_addon.index;
		}
		return null;
	}
	
	WorkshopAPI.GetAddonMeta = (index) => {
		return p2_addon;
	}
	
	WorkshopAPI.GetAddonChapters = (index) => {
		return p2_chapters;
	}

} else { $.Msg('Skipping override...') }