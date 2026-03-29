'use strict';

class HudMoviePlayer {
    static movie = $<Movie>('#HudMovie')!;
    static uuid = 0;
    static {
        GameInterfaceAPI.RegisterGameEventHandler('player_say', (event_name, params) => {
            // say command
            if (params.text === 'panorama_debug_skipmovie' && this.movie.visible) {
                // ADDED FOR DEBUGGING BECAUSE I AM NOT GOING TO WATCH TURRET OPERA EVERY TIME
                this.movie.SeekPercent(0.9);
            }
        });

        $.RegisterForUnhandledEvent('ShowMovie', (path: string, cmd: string) => {
            // replace bik
            if (path.endsWith('.bik')) {
                path = path.replace('.bik', '.webm');
            }

            $.Msg(`ShowMovie: ${path}`);

            // show us and play movie
            this.movie.visible = true;
            this.movie.SetMovie(`file://{media}/${path}`);
            // movie panel is tied to a different volume convar but it's only read
            // once when the panel is constructed. need a better way to do this.
            this.movie.SetPlaybackVolume(0.05);
            this.movie.Play();

            // clear out the last end event so it doesn't repeat
            if (this.uuid) {
                $.UnregisterEventHandler('MoviePlayerPlaybackEnded', this.movie, this.uuid);
            }

            // set the ending event
            this.uuid = $.RegisterEventHandler('MoviePlayerPlaybackEnded', this.movie, () => {
                if (!this.movie.visible) return;

                this.movie.visible = false;

                // allow only end_movie [logic_playmovie] or disconnect
                // additionally block multi-chained commands from firing
                if ((!cmd.startsWith('end_movie') && cmd !== 'disconnect') || cmd.includes(';')) {
                    $.Warning('Ending callback command to fire was not expected! Not executing!');
                    return;
                }
                GameInterfaceAPI.ConsoleCommand(cmd);
            });
        });

        // pause the movie when the pause menu is invoked
        $.RegisterForUnhandledEvent('ShowPauseMenu', () => {
            if (this.movie.visible)
                this.movie.Pause();
        });

        // unpause the movie... you get the idea
        $.RegisterForUnhandledEvent('HidePauseMenu', () => {
            if (this.movie.visible)
                this.movie.Play();
        });
    }
}
