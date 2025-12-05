'use strict';

class FeaturedMenu {
	// avatars
	// TODO: these are intended to be created dynamically (exception of the main feature)
	// do that sometime soon when we get the stuff in
	static avatar01 = $<AvatarImage>('#MainFeatureAvatar')!;
	static avatar02 = $<AvatarImage>('#MinorFeature01Avatar')!;
	static avatar03 = $<AvatarImage>('#MinorFeature02Avatar')!;
	static avatar04 = $<AvatarImage>('#MinorFeature03Avatar')!;
	static avatar05 = $<AvatarImage>('#MinorFeature04Avatar')!;

	static onLoad() {
		$.DispatchEvent(
			'MainMenuSetPageLines',
			tagDevString('Featured'),
			tagDevString('Explore highlighted Workshop content')
		);

		const XUID = UserAPI.GetXUID();
		this.avatar01.steamid = XUID;
		this.avatar02.steamid = XUID;
		this.avatar03.steamid = XUID;
		this.avatar04.steamid = XUID;
		this.avatar05.steamid = XUID;
	}
}
