import { makeState } from '../../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'dash.main.site', {
	url: '/site',
	lazyLoad: () => $import( './site.module' ),
	resolve: {

		/*@ngInject*/
		payload: function()
		{
			return Api.sendRequest( '/web/dash/sites' );
		},
	}
} );
