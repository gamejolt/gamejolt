angular.module( 'App.Views' ).controller( 'Discover.Games.View.Download.SoundtrackCtrl', function(
	$scope, $sce, $window, $timeout, Translate, Game_Song )
{
	var _this = this;

	Translate.pageTitle( 'game.download.soundtrack.page_title', { game: $scope.gameCtrl.game.title } );

	this.src = undefined;

	// If they click away from the page before the download starts, then cancel the download redirect.
	var shouldDownload = true;
	var downloadPromise = Game_Song.getSoundtrackDownloadUrl( $scope.gameCtrl.game.id )
		.then( function( response )
		{
			if ( shouldDownload ) {
				_this.src = $sce.trustAsResourceUrl( response.downloadUrl );
			}

			downloadPromise = null;
		} );

	$scope.$on( '$stateChangeStart', function()
	{
		shouldDownload = false;
	} );
} );
