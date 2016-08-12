angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'library', {
		abstract: true,
		controller: 'LibraryCtrl',
		controllerAs: 'libraryCtrl',
		template: '<ui-view></ui-view>',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
		}
	} );
} );
