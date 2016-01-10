angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.builds.add', {
		url: '/add',
		controller: function( $scope, $stateParams )
		{
			$scope.buildsCtrl.activeItem = null;
			$scope.buildsCtrl.isAdding = true;
		},
	} );
} );
