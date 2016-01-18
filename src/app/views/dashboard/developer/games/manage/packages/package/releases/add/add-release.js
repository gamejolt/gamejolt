angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.package.releases.add', {
		url: '/add',
		controller: function( $scope )
		{
			$scope.releasesCtrl.activeItem = null;
			$scope.releasesCtrl.isAdding = true;
		},
	} );
} );
