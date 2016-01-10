angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.AddCtrl', function( $scope, $state, Translate )
{
	Translate.pageTitle( 'dash.games.media.add.page_title', { game: $scope.manageCtrl.game.title } );

	this.onImageSubmit = function( formModel )
	{
		$state.go( '^.list' );
	};

	this.onVideoSubmit = function( formModel )
	{
		$state.go( '^.list' );
	};
} );
