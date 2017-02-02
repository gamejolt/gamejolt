import { Component, Inject, Input, OnInit } from 'ng-metadata/core';
import * as template from '!html-loader!./deal.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';

@Component({
	selector: 'route-discover-deal',
	template,
})
export class RouteDealComponent implements OnInit
{
	@Input() payload: any;
	@Input() overview: any;

	saleEnd: number;
	game: any;
	mediaItems: any[];
	supporters: any[];

	constructor(
		@Inject( 'Meta' ) private meta: Meta,
		@Inject( 'Game_Screenshot' ) private screenshotModel: any,
		@Inject( 'Game_Video' ) private videoModel: any,
	)
	{
	}

	ngOnInit()
	{
		this.meta.title = 'Sale';

		this.game = new Game( this.payload.game );
		this.supporters = User.populate( this.overview.supporters );

		this.saleEnd = Date.now() + (86400 * 1000);

		this.mediaItems = [];
		if ( this.overview.mediaItems && this.overview.mediaItems.length ) {
			this.overview.mediaItems.forEach( ( item: any ) =>
			{
				if ( item.media_type == 'image' ) {
					this.mediaItems.push( new this.screenshotModel( item ) );
				}
				else if ( item.media_type == 'video' ) {
					this.mediaItems.push( new this.videoModel( item ) );
				}
			} );
		}
	}
}
