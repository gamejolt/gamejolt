angular.module( 'App.Views' ).controller( 'Discover.Games.ViewCtrl', function(
	$scope, $stateParams, $injector, $timeout,
	Environment, Location, Api, Payload, SplitTest, Growls, Analytics, Report_Modal, gettextCatalog,
	Game, Game_ViewState, GameLibrary_Game, Game_Rating, Game_ScoreTable,
	Registry, Scroll )
{
	var _this = this;

	$scope.Game = Game;
	$scope.Game_ViewState = Game_ViewState;

	this.isLoaded = false;
	this.game = Registry.find( 'Game', $stateParams.id );
	this.isNavAffixed = false;
	this.installableBuilds = [];
	this.browserBuilds = [];

	// Overview page will populate this.
	// We only need it for the overview page, but we need to show it in the view of this controller.
	this.mediaBarItems = [];
	this.notificationCounts = {};

	$scope.$watch( '::gameCtrl.game', function( game )
	{
		if ( angular.isUndefined( game ) ) {
			return;
		}

		Game_ViewState.setGame( game );

		Location.enforce( {
			slug: game.slug,
		} );

		// If the game has a GA tracking ID, then we attach it to this scope so all page views within get tracked.
		if ( game.ga_tracking_id ) {
			Analytics.attachAdditionalPageTracker( $scope, game.ga_tracking_id );
		}
	} );

	$scope.$on( '$destroy', function()
	{
		Game_ViewState.clear();
	} );

	Api.sendRequest( '/web/discover/games/' + $stateParams.id )
		.then( function( payload )
		{
			_this.init( payload );
		} )
		.catch( function( e )
		{
			Payload.handlePayloadError( e );
		} );

	this.init = function( payload )
	{
		this.isLoaded = true;

		// Load in the full data that we have for the game.
		var game = new Game( payload.game );
		if ( this.game ) {
			this.game.assign( game );
		}
		else {
			this.game = game;
		}

		this.followerCount = payload.followerCount;
		this.libraryGame = payload.libraryGame ? new GameLibrary_Game( payload.libraryGame ) : null;
		this.newsArticlesCount = payload.newsArticlesCount || 0;
		this.trophiesCount = payload.trophiesCount || 0;
		this.hasScores = payload.hasScores || false;
		this.primaryScoreTable = payload.primaryScoreTable ? new Game_ScoreTable( payload.primaryScoreTable ) : null;

		processRatingPayload( payload );

		// Don't hook up the events until we're primed.
		this.onFollowClick = onFollowClick;
		this.refreshRatingInfo = refreshRatingInfo;
		this.report = report;
		this.scrollToMultiplePackages = scrollToMultiplePackages;
		this.scrollToPackagePayment = scrollToPackagePayment;

		// Any game rating change will broadcast this event.
		// We catch it so we can update the page with the new rating! Yay!
		$scope.$on( 'onGameRatingChange', onGameRatingChange );

		// For syncing game data to client.
		if ( Environment.isClient ) {

			// Only sync if it's in library.
			return $injector.get( 'LocalDb_Game' ).fetch( game.id )
				.then( function( localGame )
				{
					if ( localGame ) {
						return $injector.get( 'LocalDb_Sync' ).syncGame( game.id, game );
					}
				} );
		}
	};

	function onFollowClick()
	{
		if ( this.libraryGame ) {
			this.libraryGame.$remove().then( function( response )
			{
				_this.libraryGame = null;
				_this.followerCount = response.followers;
				Growls.success(
					gettextCatalog.getString( 'library.followed.remove_game_success_growl', { game: _this.game.title } ),
					gettextCatalog.getString( 'library.followed.remove_game_success_growl_title', { game: _this.game.title } )
				);
			} )
			.catch( function()
			{
				Growls.success(
					gettextCatalog.getString( 'library.followed.remove_game_error_growl' ),
					gettextCatalog.getString( 'library.followed.remove_game_error_growl_title' )
				);
			} );

			Analytics.trackEvent( 'game-following', 'unfollow' );
		}
		else {
			var newLibraryGame = new GameLibrary_Game( { game_id: this.game.id } );

			newLibraryGame.$save().then( function( response )
			{
				_this.libraryGame = newLibraryGame;
				_this.followerCount = response.followers;
				Growls.success(
					gettextCatalog.getString( 'library.followed.add_game_success_growl', { game: _this.game.title } ),
					gettextCatalog.getString( 'library.followed.add_game_success_growl_title', { game: _this.game.title } )
				);
			} )
			.catch( function()
			{
				Growls.success(
					gettextCatalog.getString( 'library.followed.add_game_error_growl' ),
					gettextCatalog.getString( 'library.followed.add_game_error_growl_title' )
				);
			} );

			Analytics.trackEvent( 'game-following', 'follow' );
		}
	}

	function refreshRatingInfo()
	{
		Api.sendRequest( '/web/discover/games/refresh-rating-info/' + this.game.id, null, { detach: true } ).then( processRatingPayload );
	}

	function processRatingPayload( payload )
	{
		_this.userRating = payload.userRating ? new Game_Rating( payload.userRating ) : null;
		_this.ratingBreakdown = payload.ratingBreakdown;
		_this.game.rating_count = payload.game.rating_count;
		_this.game.avg_rating = payload.game.avg_rating;
	}

	function onGameRatingChange( event, gameId )
	{
		if ( gameId == _this.game.id ) {
			_this.refreshRatingInfo();
		}
	}

	function report()
	{
		Report_Modal.show( _this.game );
	}

	function scrollToMultiplePackages()
	{
		_this.showMultiplePackagesMessage = true;
		Scroll.to( 'game-releases' );
	}

	function scrollToPackagePayment( package )
	{
		Scroll.to( 'game-package-card-' + package.id );
		$scope.$broadcast( 'Game_Package_Card.showPaymentOptions', package );
	}
} );
