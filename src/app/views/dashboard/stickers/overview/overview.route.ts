import { RouteConfig } from 'vue-router';

export const routeDashStickersOverview: RouteConfig = {
	name: 'dash.stickers.overview',
	path: '/dashboard/stickers',
	// Same chunk as parent
	component: () => import(/* webpackChunkName: "routeDashStickers" */ './overview.vue'),
};
