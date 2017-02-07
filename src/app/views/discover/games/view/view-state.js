angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view', {
		abstract: true,
		url: '/{slug:string}/{id:int}?ref',
		controller: 'Discover.Games.ViewCtrl',
		controllerAs: 'gameCtrl',
		templateUrl: require( './view.html' ),
		resolve: {
			tickSource: function( $stateParams, HistoryTick, PartnerReferral )
			{
				HistoryTick.trackSource( 'Game', $stateParams.id );
				PartnerReferral.trackReferrer( 'Game', $stateParams.id );
			}
		}
	} );
} );
