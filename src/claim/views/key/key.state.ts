import * as angular from 'angular';
import { Transition, StateService } from 'angular-ui-router';
import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

angular.module( 'App.Views' ).config( ( $urlMatcherFactoryProvider: any ) =>
{
	$urlMatcherFactoryProvider.type( 'keyCode', {
		pattern: /[a-zA-Z0-9]+/
	} );
} );

makeState( 'key', {
	url: '/claim/{key:keyCode}/{bundleGameId:int}?thanks',
	lazyLoad: () => $import( './key.module' ),
	params: {
		bundleGameId: {
			value: null,
			squash: true,
		},
	},
	resolve: {

		/*@ngInject*/
		payload: ( $transition$: Transition ) =>
		{
			let url = '/claim/view/' + $transition$.params().key;

			if ( $transition$.params().bundleGameId ) {
				url += '?game_id=' + $transition$.params().bundleGameId;
			}

			return Api.sendRequest( url );
		},

		/*@ngInject*/
		checkValid: ( $state: StateService, payload: any ) =>
		{
			if ( payload.error === 'invalid-key' ) {
				$state.go( 'invalid-key' );
				return false;
			}
		}
	}
} );
