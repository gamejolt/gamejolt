angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'library', {
		abstract: true,
		controller: 'LibraryCtrl',
		controllerAs: 'libraryCtrl',
		templateUrl: '/app/views/library/library.html',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			libraryPayload: function( Api )
			{
				return Api.sendRequest( '/web/library' );
			},
		}
	} );
} );
