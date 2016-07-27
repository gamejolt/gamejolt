import { Component, Inject, Input } from 'ng-metadata/core';
import template from 'html!./follow-widget.html';

@Component({
	selector: 'gj-game-follow-widget',
	template,
})
export class FollowWidgetComponent
{
	@Input( '<' ) game: any;

	followTooltip: string;
	isProcessing = false;

	constructor(
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'Growls' ) private Growls: any,
	)
	{
		this.followTooltip = gettextCatalog.getString( 'Follow this game to add it to your Library and be notified when new posts are added.' );
	}

	onClick()
	{
		if ( this.isProcessing ) {
			return;
		}

		this.isProcessing = true;
		let promise: ng.IPromise<any>;

		if ( !this.game.is_following ) {
			promise = this.game.$follow()
				.catch( () =>
				{
					this.Growls.error(
						this.gettextCatalog.getString( 'Something has prevented you from following this game.' )
					);
				} );
		}
		else {
			promise = this.game.$unfollow()
				.catch( () =>
				{
					this.Growls.error(
						this.gettextCatalog.getString( 'library.followed.remove_game_error_growl' ),
						this.gettextCatalog.getString( 'library.followed.remove_game_error_growl_title' )
					);
				} );
		}

		promise.then( () => this.isProcessing = false );
	}
}
