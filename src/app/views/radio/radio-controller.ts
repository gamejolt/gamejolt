import { Injectable, Inject } from 'ng-metadata/core';
import { Meta } from './../../../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class RadioCtrl
{
	song: any;
	game: any;

	currentSongTime: number;
	currentSongDuration: number;

	constructor(
		@Inject( 'Environment' ) env: any,
		@Inject( 'Meta' ) private meta: Meta,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Game_Song' ) private songModel: any,
		@Inject( 'Game' ) private gameModel: any,
		@Inject( 'Analytics' ) private analytics: any,
	)
	{
		meta.title = 'Indie Game Radio';
		meta.description = 'Discover new game songs through the Game Jolt radio!';

		// Starting the next song will actually change the title.
		if ( !env.isPrerender ) {
			this.getNextSong();
		}
	}

	getNextSong()
	{
		this.api.sendRequest( '/web/radio/get-random-song' )
			.then( ( payload: any ) =>
			{
				this.song = new this.songModel( payload.song );
				this.game = new this.gameModel( payload.game );
				this.meta.title = this.song.title;
				this.analytics.trackEvent( 'radio', 'load-song' );
			} );
	}
}
