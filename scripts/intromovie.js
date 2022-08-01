"use strict";

// eslint-disable-next-line no-unused-vars
class IntroMovieController {
	static moviePlayer;

	static showIntroMovie() {
		const movieName = "file://{media}/valve.webm";
		IntroMovieController.moviePlayer.SetMovie(movieName);

		// This function is called from CGameUI::OnGameUIActivated()
		// For now, we schedule the movie to play on the next frame because the first frame is so long that it causes the videoplayer to
		// stutter. The same bug can be seen if you hit a breakpoint, then resume during a video playback with audio.
		$.Schedule(0.0, IntroMovieController.playIntroMovie);
		IntroMovieController.moviePlayer.SetFocus();
		$.RegisterKeyBind(
			$("#IntroMoviePlayer"),
			"key_enter,key_space,key_escape",
			IntroMovieController.skipIntroMovie
		);
	}

	static playIntroMovie() {
		IntroMovieController.moviePlayer.Play();
	}

	static skipIntroMovie() {
		IntroMovieController.moviePlayer.Stop();
	}

	static destroyMoviePlayer() {
		IntroMovieController.moviePlayer.SetMovie("");
	}

	static hideIntroMovie() {
		// Can't destroy the movie player straight away as this event has been dispatched by the video player itself
		// and therefore delay the destruction to the next iteration of the scheduler.
		$.Schedule(0.0, IntroMovieController.destroyMoviePlayer);
		$.DispatchEvent("ChaosHideIntroMovie");
	}

	static {
		IntroMovieController.moviePlayer = $("#IntroMoviePlayer");
		$.RegisterForUnhandledEvent("ChaosShowIntroMovie", IntroMovieController.showIntroMovie);
		$.RegisterEventHandler(
			"MoviePlayerPlaybackEnded",
			IntroMovieController.moviePlayer,
			IntroMovieController.hideIntroMovie
		);
	}
}
