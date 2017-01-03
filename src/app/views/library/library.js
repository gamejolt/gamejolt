angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'library', {
		abstract: true,
		url: '/library',
		template: '<ui-view></ui-view>',
		resolve: {
			init: function( Translate, Shell )
			{
				return Translate.loadSection( 'main' )
					.then( function()
					{
						return Shell.bootstrapPomise;
					} );
			},
		}
	} );
} );
