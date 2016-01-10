angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'jobs', {
		abstract: true,
		url: '/jobs',
		template: '<ui-view></ui-view>',
		resolve: {
			payload: function( User )
			{
				return User.touch();
			}
		},
	} );
} );
