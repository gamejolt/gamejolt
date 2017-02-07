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

	constructor(
		@Inject( 'Meta' ) private meta: Meta,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'App' ) public app: App,
	)
	{
	}

	ngOnInit()
	{
		this.meta.title = 'Sell Your Games';

		this.meta.description = this.payload.metaDescription;
		this.meta.fb = this.payload.fb;
		this.meta.twitter = this.payload.twitter;
		this.meta.fb.image = this.meta.twitter.image = require( './social.png' );

		this.firesidePosts = FiresidePost.populate( this.payload.firesidePosts );
		this.games = Game.populate( this.payload.games );
	}
}
