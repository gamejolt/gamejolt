angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.HeaderCtrl', function( $scope, Translate, Popover, Scroll )
{
	Translate.pageTitle( 'dash.games.header.page_title', { game: $scope.manageCtrl.game.title } );

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
		Translate.growl( 'success', 'dash.games.header.saved' );
		Scroll.to( 0 );
	};
} );
