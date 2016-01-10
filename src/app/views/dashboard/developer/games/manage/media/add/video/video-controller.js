angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.Add.VideoCtrl', function( $scope, $state, Translate )
{
	Translate.pageTitle( 'dash.games.media.add.video.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSubmit = function()
	{
		$state.go( '^.^.list' );
	};
} );
