angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'search', {
		abstract: true,
		controller: 'SearchCtrl',
		controllerAs: 'searchCtrl',
		templateUrl: '/app/views/search/search.html',
	} );
} );
