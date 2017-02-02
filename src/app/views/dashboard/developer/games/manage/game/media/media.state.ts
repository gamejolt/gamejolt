import { Transition } from 'angular-ui-router';
import { makeState } from '../../../../../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'dashboard.developer.games.manage.game.media', {
	url: '/media',
	lazyLoad: () => $import( './media.module' ),
	resolve: {

		/*@ngInject*/
		payload: ( $transition$: Transition ) =>
			Api.sendRequest( '/web/dash/developer/games/media/' + $transition$.params().id ),
	}
} );
