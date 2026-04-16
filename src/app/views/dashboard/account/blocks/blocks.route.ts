import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountBlocks: RouteRecordRaw = {
	name: 'dash.account.blocks',
	path: 'blocks',
	component: () => import('~app/views/dashboard/account/blocks/RouteDashAccountBlocks.vue'),
};
