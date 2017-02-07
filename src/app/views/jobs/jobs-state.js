angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'jobs', {
		abstract: true,
		url: '/jobs',
		template: '<ui-view></ui-view>',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			payload: function( User )
			{
				return User.touch();
			}
		},
	} );
} );
