angular.module( 'App.Views' ).config( function( $stateProvider, ProtocolWatcherProvider )
{
	ProtocolWatcherProvider.registerSecure( 'dashboard.account' );

	$stateProvider.state( 'dashboard.account', {
		abstract: true,
		templateUrl: '/app/views/dashboard/account/account.html',
		controllerAs: 'accountCtrl',
		controller: angular.noop,
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/touch' );
			}
		}
	} );
} );
