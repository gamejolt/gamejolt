import { RouteConfig } from 'vue-router';
import { routeWeplayInfo } from './info/info.route';

export const routeWeplay: RouteConfig = {
	name: 'weplay',
	path: '/stajoltia',
	component: () => import(/* webpackChunkName: "routeWeplay" */ './weplay.vue'),
	children: [routeWeplayInfo],
};
