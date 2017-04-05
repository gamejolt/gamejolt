// angular.module( 'App.Views' ).config( function( $stateProvider )
// {
// 	$stateProvider.state( 'discover.games.view.devlog.view', {
// 		url: '/:postSlug',
// 		controller: 'Discover.Games.View.Devlog.ViewCtrl',
// 		controllerAs: 'viewCtrl',
// 		templateUrl: require( './view.html' ),
// 		resolve: {
// 			payload: function( $stateParams, Api, Fireside_Post )
// 			{
// 				var postHash = Fireside_Post.pullHashFromUrl( $stateParams.postSlug );
// 				return Api.sendRequest( '/web/discover/games/devlog/' + $stateParams['id'] + '/' + postHash );
// 			},
// 		}
// 	} );
// } );
