angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.builds.supplemental-files', {
		url: '/{buildId:int}/supplemental-files',
		controller: function( $scope, $stateParams )
		{
			$scope.buildsCtrl.activeItem = $stateParams.buildId;
			$scope.buildsCtrl.buildTab = 'supplemental-files';
		},
	} );
} );
