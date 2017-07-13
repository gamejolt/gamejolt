// import { makeState } from '../../../../../lib/gj-lib-client/utils/angular-facade';
// import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

// makeState('dash.main.site', {
// 	url: '/site',
// 	lazyLoad: () => import('./site.module'),
// 	resolve: {
// 		/*@ngInject*/
// 		payload: function() {
// 			return Api.sendRequest('/web/dash/sites');
// 		},
// 	},
// });

import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashMainSite: VueRouter.RouteConfig = {
	name: 'dash.main.site',
	path: 'site',
	props: true,
	component: () => asyncComponentLoader(import('./site')),
};
