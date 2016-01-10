angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.Add.ImageCtrl', function( $scope, $state, Translate )
{
	Translate.pageTitle( 'dash.games.media.add.image.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSubmit = function()
	{
		$state.go( '^.^.list' );
	};
} );
