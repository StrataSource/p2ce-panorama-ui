'use strict';

class LaserChannelPan {
	container: Panel;
	colors: ConVarColorDisplay;
}

class LaserChannels {
	static pan_gridContainer: Panel = $('#ChannelGrid');
	static pan_channels: LaserChannelPan[] = [];

	static onLoad() {
		const ctx = $.GetContextPanel();
		this.pan_gridContainer.RemoveAndDeleteChildren ();
		this.pan_channels = [];

		for (let y = 0; y < 4; y++) {
			const row = $.CreatePanel( "Panel", this.pan_gridContainer, `row${y}`, {} );
			row.AddClass("flow-right");
			for (let x = 0; x < 4; x++) {
				const channel = String.fromCharCode( "A".charCodeAt(0) + (y*4) + x );
				const channelPan = $.CreatePanel( "Panel", row, `channel${channel}`);
				channelPan.LoadLayoutSnippet("channel");
				const colorPan = channelPan.FindChildTraverse("cvar-color");
				colorPan.text = channel;
				colorPan.convar = `cl_laser_channel_color_${channel.toLowerCase()}`;

				this.pan_channels.push({
					container: channelPan,
					colorPan
				});
			}
		}
	}
}
