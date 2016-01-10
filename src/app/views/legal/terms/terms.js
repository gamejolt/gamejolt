angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'legal.terms', {
		url: '/terms',
		controller: 'Legal_TermsCtrl',
		controllerAs: 'termsCtrl',
		templateUrl: '/app/views/legal/terms/terms.html',
		resolve: {
			payload: function( User )
			{
				// No need to wait on this.
				User.touch();
			}
		}
	} );
} );
