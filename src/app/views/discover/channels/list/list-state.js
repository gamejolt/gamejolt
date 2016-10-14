angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels.list', {
		url: '',
		controller: 'Discover.Channels.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/channels/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/channels' );
			},
		}
	} );
} );
