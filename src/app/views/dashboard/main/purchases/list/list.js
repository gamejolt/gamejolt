angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.purchases.list', {
		url: '',
		controller: 'Dashboard.Main.Purchases.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/main/purchases/list/list.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/purchases' );
			}
		}
	} );
} );
