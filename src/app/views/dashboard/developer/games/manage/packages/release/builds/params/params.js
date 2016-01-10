angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.builds.params', {
		url: '/{buildId:int}/params',
		controller: function( $scope, $stateParams )
		{
			$scope.buildsCtrl.activeItem = $stateParams.buildId;
			$scope.buildsCtrl.buildTab = 'params';
		},
	} );
} );
