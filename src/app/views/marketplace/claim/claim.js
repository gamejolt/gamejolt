angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'marketplace.claim', {
		url: '/marketplace/claim/:key',
		controller: 'Marketplace.ClaimCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/marketplace/claim/claim.html',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/marketplace/claim/' + $stateParams.key );
			},
		}
	} );
} );
