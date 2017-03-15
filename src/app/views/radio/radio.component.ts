import { Component, Inject, OnInit, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./radio.component.html';

import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { Analytics } from '../../../lib/gj-lib-client/components/analytics/analytics.service';

require( './radio.styl' );

@Component( {
	selector: 'route-radio',
	template,
})
export class RouteRadioComponent implements OnInit
{
	@Input() payload: any;

	song: any;
	game: any;

	currentSongTime: number;
	currentSongDuration: number;

	constructor(
		@Inject( 'Game_Song' ) private songModel: any,
	)
	{
	}

	ngOnInit()
	{
		Meta.title = 'Indie Game Radio';
		Meta.description = 'Discover new game songs through the Game Jolt radio!';

		// Starting the next song will actually change the title.
		if ( !Environment.isPrerender ) {
			this.getNextSong();
		}
	}

	async getNextSong()
	{
		const payload = await Api.sendRequest( '/web/radio/get-random-song' );

		this.song = new this.songModel( payload.song );
		this.game = new Game( payload.game );
		Meta.title = this.song.title;
		Analytics.trackEvent( 'radio', 'load-song' );
	}
}
