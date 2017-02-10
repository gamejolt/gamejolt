import { Component, OnInit, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./marketplace.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { App } from '../../../../checkout/app-service';

@Component({
	selector: 'route-landing-marketplace',
	template,
})
export class RouteMarketplaceComponent implements OnInit
{
	@Input() payload: any;

	firesidePosts: FiresidePost[];
	games: any[];

	screen = Screen;

	constructor(
		@Inject( 'App' ) public app: App,
	)
	{
	}

	ngOnInit()
	{
		Meta.title = 'Sell Your Games';

		Meta.description = this.payload.metaDescription;
		Meta.fb = this.payload.fb;
		Meta.twitter = this.payload.twitter;
		Meta.fb.image = Meta.twitter.image = require( './social.png' );

		this.firesidePosts = FiresidePost.populate( this.payload.firesidePosts );
		this.games = Game.populate( this.payload.games );
	}
}
