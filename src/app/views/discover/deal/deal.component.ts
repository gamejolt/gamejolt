import { Component, Input, OnInit } from 'ng-metadata/core';
import * as template from '!html-loader!./deal.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { GameScreenshot } from '../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../lib/gj-lib-client/components/game/video/video.model';

require( './deal.styl' );

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

	ngOnInit()
	{
		Meta.title = 'Sale';

		this.game = new Game( this.payload.game );
		this.supporters = User.populate( this.overview.supporters );

		this.saleEnd = Date.now() + (86400 * 1000);

		this.mediaItems = [];
		if ( this.overview.mediaItems && this.overview.mediaItems.length ) {
			this.overview.mediaItems.forEach( ( item: any ) =>
			{
				if ( item.media_type === 'image' ) {
					this.mediaItems.push( new GameScreenshot( item ) );
				}
				else if ( item.media_type === 'video' ) {
					this.mediaItems.push( new GameVideo( item ) );
				}
			} );
		}
	}
}
