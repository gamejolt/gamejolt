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

	constructor(
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'Growls' ) private Growls: any,
		@Inject( 'Analytics' ) private Analytics: any,
	)
	{
		this.followTooltip = gettextCatalog.getString( 'Follow this game to add it to your Library and be notified when new posts are added.' );
	}

	follow()
	{
		if ( !this.game.is_following ) {
			this.game.$follow()
				.catch( () =>
				{
					this.Growls.error(
						this.gettextCatalog.getString( 'Something has prevented you from following this game.' )
					);
				} );

			this.Analytics.trackEvent( 'game-following', 'follow' );
		}
		else {
			this.game.$unfollow()
				.catch( () =>
				{
					this.Growls.error(
						this.gettextCatalog.getString( 'library.followed.remove_game_error_growl' ),
						this.gettextCatalog.getString( 'library.followed.remove_game_error_growl_title' )
					);
				} );

			this.Analytics.trackEvent( 'game-following', 'unfollow' );
		}
	}
}
