'use strict';

const SettingsTabs = {
	InputSettings: {
		xml: 'input',
		radioid: 'InputRadio',
		children: {
			MouseSubSection: 'MouseRadio',
			KeybindSubSection: 'KeybindRadio'
		}
	},
	AudioSettings: {
		xml: 'audio',
		radioid: 'AudioRadio',
		children: {
			VolumeSubSection: 'VolumeRadio',
			AudioDeviceSubSection: 'AudioDeviceRadio'
		}
	},
	VideoSettings: {
		xml: 'video',
		radioid: 'VideoRadio',
		children: {
			VideoSubSection: 'VideoSubRadio',
			AdvancedVideoSubSection: 'AdvancedVideoRadio',
			TextureReplaceSubSection: 'TextureReplaceRadio'
		}
	},
	InterfaceSettings: {
		xml: 'interface',
		radioid: 'InterfaceRadio',
		children: {
			UISubSection: 'UIRadio'
		}
	},
	SearchSettings: {
		xml: 'search'
	}
};
