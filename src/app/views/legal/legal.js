angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'legal', {
		abstract: true,
		templateUrl: '/app/views/legal/legal.html',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			touch: function( User )
			{
				// No need to wait on this.
				User.touch();
			},
		}
	} );
} );
