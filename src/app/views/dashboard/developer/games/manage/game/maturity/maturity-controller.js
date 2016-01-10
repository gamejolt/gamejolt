angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.MaturityCtrl', function( $scope, Translate, Scroll )
{
	Translate.pageTitle( 'dash.games.maturity.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSaved = function()
	{
		Translate.growl( 'success', 'dash.games.maturity.saved' );
		Scroll.to( 0 );
	};
} );
