// ==============================================================================================================
// Pivot: This is probably the ugliest fucking adaptation of Momentum Mod UI code I've ever done for P2:CE yet.
// The ambience sound code located at momentum\panorama\scripts\pages\main-menu\main-menu-sounds.ts
// has essentially been reduced to nothing but a two-function event handler.
//
// Somebody whack me with a trout already.
// ==============================================================================================================

'use strict';

$.RegisterForUnhandledEvent('PopulateLoadingScreen', () => playMapLoadMusic());
$.RegisterForUnhandledEvent('MapLoaded', () => stopMapLoadMusic());

function playMapLoadMusic() {
	$.PlaySoundEvent('UIPanorama.P2CE.MenuFocus');
	$.PlaySoundEvent('UIPanorama.Music.P2CE.Menu3_LOAD');
}

function stopMapLoadMusic() {
	$.PlaySoundEvent('UIPanorama.Music.StopAll');
	$.PlaySoundEvent('UIPanorama.P2CE.MenuAccept');
}
