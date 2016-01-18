angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.HeaderCtrl', function( $scope, App, Popover, Scroll, Growls, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.header.page_title', { game: $scope.manageCtrl.game.title } );

	$scope.manageCtrl.shouldShowGameCover = true;
	$scope.$on( '$stateChangeStart', function()
	{
		$scope.manageCtrl.shouldShowGameCover = false;
	} );

	this.clearHeader = function()
	{
		Popover.hideAll();
		$scope.manageCtrl.game.$clearHeader();
	};

	this.onSaved = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.header.saved_growl' ),
			gettextCatalog.getString( 'dash.games.header.saved_growl_title' )
		);
		Scroll.to( 0 );
	};
} );
