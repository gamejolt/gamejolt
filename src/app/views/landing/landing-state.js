angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing', {
		abstract: true,
		template: '<ui-view></ui-view>',
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
