angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.builds.launch-options', {
		url: '/{buildId:int}/launch-options',
		controller: function( $scope, $stateParams )
		{
			$scope.buildsCtrl.activeItem = $stateParams.buildId;
			$scope.buildsCtrl.buildTab = 'launch-options';
		},
	} );
} );
