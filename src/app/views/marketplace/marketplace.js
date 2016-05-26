angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'marketplace', {
		abstract: true,
		template: '<ui-view><ui-view>',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
		}
	} );
} );
