import { Transition } from 'angular-ui-router';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { makeState } from '../../../../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'dashboard.developer.games.manage.site', {
	url: '/site',
	lazyLoad: () => $import( './site.module' ),
	resolve: {
		payload: function( $transition$: Transition )
		{
			return Api.sendRequest( '/web/dash/sites/' + $transition$.params().id );
		},
	}
} );
