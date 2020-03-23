import { RouteConfig } from 'vue-router';

export const routeDashStickersOverview: RouteConfig = {
	name: 'dash.stickers',
	path: '',
	// Same chunk as parent
	component: () => import(/* webpackChunkName: "routeDashStickers" */ './overview.vue'),
};
