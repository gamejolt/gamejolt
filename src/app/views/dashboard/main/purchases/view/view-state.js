angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.purchases.view', {
		url: '/view/:id',
		controller: 'Dashboard.Main.Purchases.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: require( './view.html' ),
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/purchases/' + $stateParams.id );
			}
		}
	} );
} );
