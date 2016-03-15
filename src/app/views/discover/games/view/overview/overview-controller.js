angular.module( 'App.Views' ).controller( 'Discover.Games.View.OverviewCtrl', function(
	$scope, $stateParams, App, Meta, Game, Game_Screenshot, Game_Song, Game_Video, Game_NewsArticle,
	Game_Package, Game_Release, Game_Build, Game_Build_LaunchOption, Environment,
	Jam,
	Api, Payload, Game_ViewState )
{
	var _this = this;

	$scope.Game = Game;

	this.isLoaded = false;
	this.currentCommentPage = $stateParams.comment_page;

	// Kind of hacky, but if we're prerendering, then we need to make sure that the details are open for the game.
	// Otherwise by default they're closed.
	this.detailsOpen = Environment.isPrerender ? true : false;
	this.isShowingRatingBreakdown = false;

	$scope.$watch( '::gameCtrl.game', function( game )
	{
		if ( angular.isUndefined( game ) ) {
			return;
		}

		_this.game = game;
		App.title = game.title + ' by ' + game.developer.display_name;

		// Wait for the game before showing extended info.
		Game_ViewState.showExtended();

		// TG: Thunder Gun widget
		if ( game.id == 64527 ) {
			_this.hasReleasesSection = true;
		}
	} );

	$scope.$watch( 'gameCtrl.hasScores && gameCtrl.trophiesCount', function( val )
	{
		// Whether or now the achievements row should be two columns.
		// When there is both scores and trophies, we split them in half.
		_this.isAchievementsTwoCol = val;
	} );

	$scope.$on( '$destroy', function()
	{
		Game_ViewState.hideExtended();
	} );

	Api.sendRequest( '/web/discover/games/overview/' + $stateParams.id )
		.then( function( payload )
		{
			_this.init( payload );

			// Remove pressure from the game overview payload by doing these after.
			Api.sendRequest( '/web/discover/games/scores/overview/' + $stateParams.id, { detach: true } ).then( function( payload )
			{
				_this.scoresPayload = payload;
			} );

			Api.sendRequest( '/web/discover/games/trophies/overview/' + $stateParams.id, { detach: true } ).then( function( payload )
			{
				_this.trophiesPayload = payload;
			} );
		} )
		.catch( function( e )
		{
			Payload.handlePayloadError( e );
		} );

	this.init = function( payload )
	{
		this.isLoaded = true;

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb;
		Meta.twitter = payload.twitter;
		this.microdata = payload.microdata ? JSON.stringify( payload.microdata ) : '{}';

		$scope.gameCtrl.notificationCounts = payload.notificationCounts || {
			news: 0,
		};

		this.downloadCount = payload.downloadCount;
		this.profileCount = payload.profileCount;

		this.developerGamesCount = payload.developerGamesCount;

		$scope.gameCtrl.mediaItems = [];
		if ( payload.mediaItems && payload.mediaItems.length ) {
			payload.mediaItems.forEach( function( item )
			{
				if ( item.media_type == 'image' ) {
					$scope.gameCtrl.mediaItems.push( new Game_Screenshot( item ) );
				}
				else if ( item.media_type == 'video' ) {
					$scope.gameCtrl.mediaItems.push( new Game_Video( item ) );
				}
			} );
		}

		this.songs = Game_Song.populate( payload.songs );
		this.latestArticles = Game_NewsArticle.populate( payload.latestArticles );
		this.recommendedGames = Game.populate( payload.recommendedGames );

		var packageData = Game_Package.processPackagePayload( payload );
		angular.extend( this, packageData );

		// The releases section exists if there are releases or songs.
		this.hasReleasesSection = this.releases.length || this.songs.length;

		/**
		 * Convenience messaging.
		 */
		$scope.$watch( '::gameCtrl.game.development_status', function( status )
		{
			if ( angular.isUndefined( status ) ) {
				return;
			}

			_this.convenienceMessage = undefined;
			if ( status == Game.DEVELOPMENT_STATUS_WIP && !_this.packages.length ) {
				_this.convenienceMessage = 'wip';
			}
			else if ( status == Game.DEVELOPMENT_STATUS_CANCELED && !_this.packages.length ) {
				_this.convenienceMessage = 'canceled-no-builds';
			}
			else if ( status == Game.DEVELOPMENT_STATUS_CANCELED && _this.packages.length ) {
				_this.convenienceMessage = 'canceled-with-builds';
			}
		} );

		/**
		 * For game stats.
		 */
		this.playsTooltip = false;
		this.showNaPlays = !this.packages.length && !(this.playCount + this.downloadCount);
		if ( this.showNaPlays ) {
			this.playsTooltip = 'games.view.stats.no_builds_tooltip';
		}
		// If they had plays from a previous build but no longer have builds.
		else if ( !this.packages.length && (this.playCount + this.downloadCount) ) {
			this.playsTooltip = 'games.view.stats.had_builds_tooltip';
		}

		/**
		 * Any active jams this game is in.
		 */
		if ( payload.activeJam ) {
			this.activeJam = new Jam( payload.activeJam );
		}
	};
} );
