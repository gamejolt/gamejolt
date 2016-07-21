angular.module( 'App.Views' ).controller( 'Discover.Games.View.OverviewCtrl', function(
	$scope, $stateParams, App, Meta, Game, Game_Screenshot, Game_Song, Game_Video, Game_NewsArticle, Fireside_Post,
	Game_Package, Game_Release, Game_Build, Game_Build_LaunchOption, User, Environment,
	Jam,
	Comment_Video,
	ActivityFeedService, History,
	Api, Payload, Analytics, SplitTest, Device, $ocLazyLoad, gettextCatalog )
{
	var _this = this;
	var wasHistoricalView = History.inHistorical;

	$scope.Game = Game;

	this.isLoaded = false;
	this.currentCommentPage = $stateParams.comment_page;
	this.videoCommentsPage = 0;

	this.isShowingRatingBreakdown = false;

	$scope.$watch( '::gameCtrl.game', function( game )
	{
		if ( angular.isUndefined( game ) ) {
			return;
		}

		_this.game = game;
		App.title = game.title + ' by ' + game.developer.display_name;
	} );

	$scope.$watch( 'gameCtrl.hasScores && gameCtrl.trophiesCount', function( val )
	{
		// Whether or now the achievements row should be two columns.
		// When there is both scores and trophies, we split them in half.
		_this.isAchievementsTwoCol = val;
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

			// We set our state to skip tracking in the state definition.
			// Track it manually here.
			// This ensures that any experiments set in the payload get tracked as well.
			Analytics.trackPageview();
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

		this.profileCount = payload.profileCount || 0;
		this.downloadCount = payload.downloadCount || 0;
		this.playCount = payload.playCount || 0;

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

		this.posts = ActivityFeedService.bootstrap( Fireside_Post.populate( payload.posts ), { inHistorical: wasHistoricalView } );
		this.songs = Game_Song.populate( payload.songs );
		this.recommendedGames = Game.populate( payload.recommendedGames );
		this.supporters = User.populate( payload.supporters );
		this.videoComments = Comment_Video.populate( payload.videoComments );
		this.videoCommentsCount = payload.videoCommentsCount || 0;

		var packageData = Game_Package.processPackagePayload( payload );
		angular.extend( this, packageData );

		var os = Device.os();
		var arch = Device.arch();

		$scope.gameCtrl.packages = this.packages || [];
		$scope.gameCtrl.installableBuilds = Game.pluckInstallableBuilds( this.packages || [], os, arch );
		$scope.gameCtrl.browserBuilds = Game.pluckBrowserBuilds( this.packages || [] );

		// On Client we only want to include HTML games.
		if ( Environment.isClient ) {
			$scope.gameCtrl.browserBuilds = _.where( $scope.gameCtrl.browserBuilds, { type: Game_Build.TYPE_HTML } );
		}

		// Pull in ROMs to the browser builds.
		$scope.gameCtrl.browserBuilds = $scope.gameCtrl.browserBuilds.concat( Game.pluckRomBuilds( _this.packages || [] ) );

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
			if ( status == Game.DEVELOPMENT_STATUS_CANCELED && !_this.packages.length ) {
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
		this.showNaPlays = false;

		if ( !this.packages.length ) {

			// If they had plays from a previous build but no longer have builds.
			if ( this.playCount + this.downloadCount ) {
				this.playsTooltip = gettextCatalog.getString( 'This game used to have playable builds but they have been removed.' );
			}
			else {
				this.showNaPlays = true;
				this.playsTooltip = gettextCatalog.getString( 'This game has no playable builds yet.' );
			}
		}

		/**
		 * Any active jams this game is in.
		 */
		if ( payload.activeJam ) {
			this.activeJam = new Jam( payload.activeJam );
		}
	};

	this.loadMoreVideoComments = function()
	{
		var _this = this;
		++this.videoCommentsPage;
		Api.sendRequest( '/web/discover/games/videos/' + $stateParams.id + '?page=' + this.videoCommentsPage )
			.then( function( response )
			{
				_this.videoComments = _this.videoComments.concat( Comment_Video.populate( response.videos ) );
			} );
	};
} );
