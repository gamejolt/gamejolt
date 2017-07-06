// import * as angular from 'angular';
// import { Transition, UrlRouter } from 'angular-ui-router';
// import { makeState } from '../../../../../lib/gj-lib-client/utils/angular-facade';
// import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

// const subStates = {
// 	'_fetch': '/{section:gamesSection}',
// 	'_fetch-category': '/{section:gamesSection}/{category:gamesCategory}',
// 	'_fetch-date': '/{section:gamesSection}/{date:gamesDate}',
// };

// /*@ngInject*/
// angular.module( 'App.Views' ).config( (
// 	$urlMatcherFactoryProvider: any,
// 	$urlRouterProvider: UrlRouter
// ) =>
// {
// 	$urlMatcherFactoryProvider.type( 'gamesSection', {
// 		pattern: /featured|new|fresh|hot|best|worst|by\-date/
// 	} );

// 	$urlMatcherFactoryProvider.type( 'gamesCategory', {
// 		pattern: /arcade|action|adventure|rpg|strategy-sim|platformer|shooter|puzzle|sports|other/
// 	} );

// 	$urlMatcherFactoryProvider.type( 'gamesDate', {
// 		pattern: /\d{4}\-\d{2}\-\d{2}/
// 	} );

// 	// Redirect old category URLs to new.
// 	$urlRouterProvider.when( '/games/{category:gamesCategory}', '/games/best/:category' );
// } );

// angular.forEach( subStates, ( url, state ) =>
// {
// 	makeState( `discover.games.list.${state}`, {
// 		url: url + '?price&os&browser&maturity&status&partners&page&query',
// 		lazyLoad: () => import( './list.module' ),
// 		lazyLoadComponent: '_fetch',
// 		resolve: {

// 			/*@ngInject*/
// 			payload: async ( $transition$: Transition, History_Cache: any, filteringContainer: any ) =>
// 			{
// 				await filteringContainer.init( 'discover.games.list.' + state, $transition$.params() );
// 				return await History_Cache.cache( () =>
// 					Api.sendRequest( '/web/discover/games?' + filteringContainer.getQueryString( $transition$.params() ) )
// 				);
// 			},
// 		},
// 	} );
// } );
