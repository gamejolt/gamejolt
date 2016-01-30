angular.module( 'App.Views' ).controller( 'Discover.Games.ViewCtrl', function(
	$scope, Location, Api, SplitTest, Game, Game_ViewState, GameLibrary_Game, Game_Rating, Game_ScoreTable, Growls, Analytics, Report_Modal, gettextCatalog, game, gamePayload )
{
	var _this = this;

	$scope.Game = Game;
	$scope.Game_ViewState = Game_ViewState;

	Location.enforce( {
		slug: game.slug,
	} );

	this.game = game;
	this.followerCount = gamePayload.followerCount;
	this.libraryGame = gamePayload.libraryGame ? new GameLibrary_Game( gamePayload.libraryGame ) : null;
	this.newsArticlesCount = gamePayload.newsArticlesCount || 0;
	this.trophiesCount = gamePayload.trophiesCount || 0;
	this.hasScores = gamePayload.hasScores || false;
	this.primaryScoreTable = gamePayload.primaryScoreTable ? new Game_ScoreTable( gamePayload.primaryScoreTable ) : null;

	// Overview page will populate this.
	// We only need it for the overview page, but we need to show it in the view of this controller.
	this.mediaBarItems = [];

	processRatingPayload( gamePayload );

	this.notificationCounts = {};

	this.isNavAffixed = false;

	this.onFollowClick = onFollowClick;
	this.refreshRatingInfo = refreshRatingInfo;
	this.report = report;

	// If the game has a GA tracking ID, then we attach it to this scope so all page views within get tracked.
	if ( game.ga_tracking_id ) {
		Analytics.attachAdditionalPageTracker( $scope, game.ga_tracking_id );
	}

	// Any game rating change will broadcast this event.
	// We catch it so we can update the page with the new rating! Yay!
	$scope.$on( 'onGameRatingChange', onGameRatingChange );

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
} );
