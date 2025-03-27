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
	CustomizationSettings: {
		xml: 'customization',
		radioid: 'CustomizationRadio',
		children: {
			Portal1SubSection: 'Portal1Radio',
			PortalsSubSection: 'PortalsRadio',
			GelsSubSection: 'GelsRadio',
			MiscSubSection: 'MiscRadio'
		}
	},
	SearchSettings: {
		xml: 'search'
	}
};
