angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'library', {
		abstract: true,
		url: '/library',
		template: '<ui-view></ui-view>',
		resolve: {
			init: function( User, Translate, Shell )
			{
				// No need to await this since library can be offline.
				User.touch();

				return Promise.all( [ Translate.loadSection( 'main' ), Shell.bootstrapPromise ] );
			},
		}
	} );
} );
