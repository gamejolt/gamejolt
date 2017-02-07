import * as angular from 'angular';
import { Transition, StateService } from 'angular-ui-router';
import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

angular.module( 'App.Views' ).config( ( $urlMatcherFactoryProvider: any ) =>
{
	$urlMatcherFactoryProvider.type( 'retrieveKey', {
		pattern: /[gb]{1}\-[0-9a-zA-Z]+/
	} );
} );

makeState( 'retrieve', {
	url: '/{input:retrieveKey}',
	lazyLoad: () => $import( './retrieve.module' ),
	params: {
		input: {
			value: null,
			squash: true,
		}
	},
	resolve: {

		/*@ngInject*/
		bootstrap: async ( $transition$: Transition, $state: StateService ) =>
		{
			let url = '/claim/retrieve';
			let type = '';
			let key = '';

			if ( $transition$.params().input ) {
				const matches = $transition$.params().input.match( /(g|b)\-([0-9a-zA-Z]+)/ );
				if ( matches[1] == 'g' ) {
					type = 'game';
				}
				else if ( matches[1] == 'b' ) {
					type = 'bundle';
				}
				else {
					$state.go( 'invalid-key' );
					return false;
				}

				key = matches[2];
				url += '/' + type + '/' + key;
			}

			return {
				type,
				key,
				payload: await Api.sendRequest( url ),
			};
		},

		/*@ngInject*/
		checkValid: ( $state: StateService, bootstrap: any ) =>
		{
			if ( !bootstrap.payload || bootstrap.payload.error === 'invalid-key' ) {
				$state.go( 'invalid-key' );
				return false;
			}
		}
	}
} );
