angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'jobs.designer', {
		url: '/designer',
		controller: 'Jobs.DesignerCtrl',
		controllerAs: 'designerCtrl',
		templateUrl: require( './designer.html' ),
	} );
} );
