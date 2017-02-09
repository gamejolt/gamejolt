angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view', {
		abstract: true,
		url: '/:slug/{id:int}?ref',
		controller: 'Discover.Games.ViewCtrl',
		controllerAs: 'gameCtrl',
		templateUrl: require( './view.html' ),
		resolve: {
			tickSource: function( $transition$, HistoryTick, PartnerReferral )
			{
				HistoryTick.trackSource( 'Game', $transition$.params().id );
				PartnerReferral.trackReferrer( 'Game', $transition$.params().id );
			}
		}
	} );
} );
