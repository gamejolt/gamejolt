import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountFacebookCallback: RouteConfig = {
	name: 'auth.linked-account.facebook.callback',
	path: 'facebook/callback',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountFacebookCallback" */ './callback'),
};

// angular.module( 'App.Views' ).config( function( $stateProvider )
// {
// 	$stateProvider.state( 'auth.linked-account.facebook.callback', {
// 		url: '/callback?code&state',
// 		controller: 'Auth.LinkedAccount.Facebook.CallbackCtrl',
// 		controllerAs: 'callbackCtrl',
// 		templateUrl: require( '../../_processing.html' ),
// 		resolve: {
// 			payload: function( Api, $stateParams )
// 			{
// 				return Api.sendRequest( '/web/auth/facebook/callback?code=' + $stateParams.code + '&state=' + $stateParams.state, {} );
// 			}
// 		},
// 	} );
// } );
