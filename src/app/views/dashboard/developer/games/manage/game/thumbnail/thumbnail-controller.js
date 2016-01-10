angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.ThumbnailCtrl', function( $scope, Translate, Scroll )
{
	Translate.pageTitle( 'dash.games.thumbnail.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSaved = function()
	{
		Translate.growl( 'success', 'dash.games.thumbnail.saved' );
		Scroll.to( 0 );
	};
} );
