angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.builds.edit', {
		url: '/{buildId:int}',
		controller: function( $scope, $stateParams )
		{
			$scope.buildsCtrl.activeItem = $stateParams.buildId;
			$scope.buildsCtrl.buildTab = 'edit';
		},
	} );
} );
