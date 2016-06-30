angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.Add.VideoCtrl', function( $scope, $state, App, gettextCatalog )
{
	/// {{ game }} is available as the game title
	App.title = gettextCatalog.getString( 'dash.games.media.add.video.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSubmit = function()
	{
		$state.go( '^.^.list' );
	};
} );
