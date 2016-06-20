angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover', {
		abstract: true,
		template: '<ui-view/>',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
		}
	} );
} );
