angular.module( 'App.Views' ).controller( 'Discover.Games.View.OverviewCtrl', function(
	$scope, $stateParams, App, Meta, Game, Game_Screenshot, Game_Song, Game_Video, Game_NewsArticle,
	Game_Package, Game_Release, Game_Build, Game_Build_LaunchOption, Environment,
	Jam, Fireside_Post,
	payload, scoresPayload, trophiesPayload )
{
	var _this = this;
	var game = $scope.gameCtrl.game;

	this.scoresPayload = scoresPayload;
	this.trophiesPayload = trophiesPayload;

	App.title = game.title + ' by ' + game.developer.display_name;
	Meta.description = payload.metaDescription;
	Meta.fb = payload.fb;
	Meta.twitter = payload.twitter;

	$scope.Game = Game;

	$scope.gameCtrl.notificationCounts = payload.notificationCounts || {
		news: 0,
	};

	this.currentCommentPage = $stateParams.comment_page;
	this.downloadCount = payload.downloadCount;
	this.profileCount = payload.profileCount;

	// Kind of hacky, but if we're prerendering, then we need to make sure that the details are open for the game.
	// Otherwise by default they're closed.
	this.detailsOpen = Environment.isPrerender ? true : false;
	this.isShowingRatingBreakdown = false;

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

	// TG: Thunder Gun widget
	if ( game.id == 64527 ) {
		this.hasReleasesSection = true;
	}

	// Whether or now the achievements row should be two columns.
	// When there is both scores and trophies, we split them in half.
	this.isAchievementsTwoCol = $scope.gameCtrl.hasScores && $scope.gameCtrl.trophiesCount;

	/**
	 * Convenience messaging.
	 */
	this.convenienceMessage = undefined;
	if ( game.development_status == Game.DEVELOPMENT_STATUS_WIP && !this.packages.length ) {
		this.convenienceMessage = 'wip';
	}
	else if ( game.development_status == Game.DEVELOPMENT_STATUS_CANCELED && !this.packages.length ) {
		this.convenienceMessage = 'canceled-no-builds';
	}
	else if ( game.development_status == Game.DEVELOPMENT_STATUS_CANCELED && this.packages.length ) {
		this.convenienceMessage = 'canceled-with-builds';
	}

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


	this.latestPosts = Fireside_Post.populate( payload.latestPosts );
	console.log( this.latestPosts );
} );
