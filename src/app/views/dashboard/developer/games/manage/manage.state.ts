import { Transition } from 'angular-ui-router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { makeState } from '../../../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'dashboard.developer.games.manage', {
	abstract: true,
	url: '/:id?wizard',
	lazyLoad: () => $import( './manage.module' ),
	resolve: {

		/*@ngInject*/
		managePayload: ( $transition$: Transition ) =>
			Api.sendRequest( '/web/dash/developer/games/' + $transition$.params().id ),
	}
} );
