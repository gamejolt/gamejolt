angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.purchases.view', {
		url: '/view/:id',
		controller: 'Dashboard.Main.Purchases.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/dashboard/main/purchases/view/view.html',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/purchases/' + $stateParams.id );
			}
		}
	} );
} );
