angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.AddCtrl', function( $scope, $state )
{
	this.onImageSubmit = function( formModel )
	{
		$state.go( '^.list' );
	};

	this.onVideoSubmit = function( formModel )
	{
		$state.go( '^.list' );
	};
} );
