angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.join.almost', {
		url: '/almost',
		views: {
			'@auth': {
				templateUrl: '/auth/views/auth/join/almost/almost.html',
				controller: function( Translate )
				{
					Translate.pageTitle( 'auth.join.almost.page_title' );
				},
			}
		},
		onEnter: function( App )
		{
			App.shouldShowCoverImage = false;
		},
		onExit: function( App )
		{
			App.shouldShowCoverImage = true;
		}
	} );
} );
