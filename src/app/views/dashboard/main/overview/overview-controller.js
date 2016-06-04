angular.module( 'App.Views' ).controller( 'Dashboard.Main.OverviewCtrl', function( $scope, $interval, $state, App, Game, Notification, Fireside_Post, gettextCatalog, payload )
{
	$scope.Game = Game;

	App.title = gettextCatalog.getString( 'dash.overview.page_title' );

	// Keep them undefined if not on the payload.
	// This will ensure that if they aren't an account with revenue, it won't show the revenue widget.
	if ( angular.isDefined( payload.revenueTotal ) && payload.revenueTotal !== null ) {
		this.revenueTotal = payload.revenueTotal / 100;
		this.revenueWithdrawn = payload.revenueWithdrawn / 100;
		this.revenueSpent = payload.revenueSpent / 100;
		this.revenueCurrent = payload.revenueCurrent / 100;
		this.revenuePendingWithdraw = payload.revenuePendingWithdraw / 100;
		this.revenuePendingActivation = payload.revenuePendingActivation / 100;
		this.walletBalance = payload.walletBalance / 100;
	}

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

	this.integrationTranslations = {
		'played_game': gettextCatalog.getString( 'dash.integrate.played_game_html' ),
		'rated_game': gettextCatalog.getString( 'dash.integrate.rated_game_html' ),
		'got_trophy': gettextCatalog.getString( 'dash.integrate.got_trophy_html' ),
		'got_score': gettextCatalog.getString( 'dash.integrate.got_score_html' ),
		'has_friend': gettextCatalog.getString( 'dash.integrate.has_friend_html' ),
		'has_facebook': gettextCatalog.getString( 'dash.integrate.has_facebook_html' ),
		'has_twitter': gettextCatalog.getString( 'dash.integrate.has_twitter_html' ),
	};
} );
