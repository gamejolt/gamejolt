angular.module( 'App.Views' ).controller( 'Dashboard.OverviewCtrl', function( $scope, $interval, $state, Translate, Game, Notification, Fireside_Post, payload )
{
	Translate.pageTitle( 'dash.overview.page_title' );

	// Keep them undefined if not on the payload.
	// This will ensure that if they aren't an account with revenue, it won't show the revenue widget.
	this.revenueTotal = payload.revenueTotal;
	this.revenueWithdrawn = payload.revenueWithdrawn;
	this.revenueCurrent = payload.revenueCurrent;
	this.revenuePending = payload.revenuePending;

	this.games = Game.populate( payload.games );

	this.activityNotifications = Notification.populate( payload.activityNotifications );
	this.latestBroadcast = payload.latestBroadcast ? new Fireside_Post( payload.latestBroadcast ) : null;

	this.integration = payload.integration || {};
	this.integrationKeys = [
		'played_game',
		'rated_game',
		'got_trophy',
		'got_score',
		'has_friend',
		'has_facebook',
		'has_twitter',
	];

	this.isFullyIntegrated = true;
	this.integrationKeys.forEach( function( key )
	{
		if ( this.integration[ key ] && !this.integration[ key ].achieved ) {
			this.isFullyIntegrated = false;
		}
	}, this );
} );
