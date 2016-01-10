angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.forgot.sent', {
		url: '/sent',
		views: {
			'@auth': {
				templateUrl: '/auth/views/auth/forgot/sent/sent.html',
				controller: function( Translate )
				{
					Translate.pageTitle( 'auth.forgot.sent.page_title' );
				}
			}
		},
	} );
} );
