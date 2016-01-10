angular.module( 'App.Views' ).directive( 'gjDashReleaseList', function( Screen,Game_Release )
{
	return {
		restrict: 'E',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/_release-list/release-list.html',
		scope: {},
		bindToController: {
			package: '=gjPackage',
			releases: '=gjReleases',
			excludedRelease: '=?excludeRelease',
		},
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
