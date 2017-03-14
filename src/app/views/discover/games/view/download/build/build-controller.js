angular.module( 'App.Views' ).controller( 'Discover.Games.View.Download.BuildCtrl', function(
	$scope, $sce, $window, $timeout, App, Game, Game_Build, Scroll, gettextCatalog, payload )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'game.download.game.page_title', { game: $scope.gameCtrl.game.title } );

	this.build = new Game_Build( payload.build );
	this.src = undefined;

	this.developerGames = Game.populate( payload.developerGames ) || [];
	this.recommendedGames = Game.populate( payload.recommendedGames ) || [];

	// If they click away from the page before the download starts, then cancel the download redirect.
	var shouldDownload = true;
	// var downloadPromise = $timeout( 5000 )
	var downloadPromise = Promise.resolve()
		.then( function()
		{
			return _this.build.getDownloadUrl( {
				forceDownload: true,
			} );
		} )
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

	window.setTimeout( function()
	{
		Scroll.to( 'page-ad-scroll' );
	}, 0 );
} );
