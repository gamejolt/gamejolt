angular.module( 'App.Views' ).controller( 'Discover.Games.View.Download.BuildCtrl', function(
	$scope, $sce, $window, $timeout, Translate, Game, Game_Build, payload )
{
	var _this = this;

	Translate.pageTitle( 'game.download.game.page_title', { game: $scope.gameCtrl.game.title } );

	this.build = new Game_Build( payload.build );
	this.src = undefined;

	this.developerGames = Game.populate( payload.developerGames ) || [];
	this.recommendedGames = Game.populate( payload.recommendedGames ) || [];

	this.twitterShareMessage = payload.twitterShareMessage || 'Check out this game!';

	// If they click away from the page before the download starts, then cancel the download redirect.
	var shouldDownload = true;
	var downloadPromise = this.build.getDownloadUrl()
		.then( function( response )
		{
			if ( shouldDownload ) {
				_this.src = $sce.trustAsResourceUrl( response.downloadUrl );
			}

			downloadPromise = null;
		} )

	$scope.$on( '$stateChangeStart', function()
	{
		shouldDownload = false;
	} );
} );
