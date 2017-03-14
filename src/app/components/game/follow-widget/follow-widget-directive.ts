import { Component, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./follow-widget.html';

import { App } from '../../../../app/app-service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

@Component({
	selector: 'gj-game-follow-widget',
	template,
})
export class FollowWidgetComponent
{
	@Input( '<' ) game: any;
	@Input( '<' ) sparse = false;

	followTooltip: string;
	isProcessing = false;

	constructor(
		@Inject( 'App' ) private app: App,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		this.followTooltip = gettextCatalog.getString( 'Follow this game to add it to your Library and be notified when new posts are added.' );
	}

	onClick()
	{
		if ( !this.app.user || this.isProcessing ) {
			return;
		}

		this.isProcessing = true;
		let promise: Promise<any>;

		if ( !this.game.is_following ) {
			promise = this.game.$follow()
				.catch( () =>
				{
					Growls.error(
						this.gettextCatalog.getString( 'Something has prevented you from following this game.' )
					);
				} );
		}
		else {
			promise = this.game.$unfollow()
				.catch( () =>
				{
					Growls.error(
						this.gettextCatalog.getString( 'library.followed.remove_game_error_growl' ),
						this.gettextCatalog.getString( 'library.followed.remove_game_error_growl_title' )
					);
				} );
		}

		promise.then( () => this.isProcessing = false );
	}
}
