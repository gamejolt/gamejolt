angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'legal.terms', {
		url: '/terms',
		controller: 'Legal_TermsCtrl',
		controllerAs: 'termsCtrl',
		templateUrl: '/app/views/legal/terms/terms.html',
	} );
} );
