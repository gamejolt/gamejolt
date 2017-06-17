import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

makeState('discover.deal', {
	url: '/deal',
	lazyLoad: () => $import('./deal.module'),
	resolve: {
		payload: () => Api.sendRequest('/web/discover/games/85944'),
		overview: () => Api.sendRequest('/web/discover/games/overview/85944'),
	},
});
