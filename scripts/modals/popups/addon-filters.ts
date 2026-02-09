'use strict';

class AddonFilters {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static workshopSpecs: Record<string, any> = {};
	static {
		this.workshopSpecs = $.LoadKeyValues3File('resource/workshop.kv3');
		$.Msg(`Addon types: ${JSON.stringify(this.workshopSpecs['categories'])}`);
		$.Msg(`Campaign tags: ${JSON.stringify(this.workshopSpecs['tags']['Campaign/Map Tags'])}`);
		$.Msg(`Addon tags: ${JSON.stringify(this.workshopSpecs['tags']['Addon Tags'])}`);
	}
}
