import { RouteConfig } from 'vue-router';

export const routeDashAccountBlocks: RouteConfig = {
	name: 'dash.account.blocks',
	path: 'blocks',
	component: () => import(/* webpackChunkName: "routeDashAccountBlocks" */ './blocks.vue'),
};
