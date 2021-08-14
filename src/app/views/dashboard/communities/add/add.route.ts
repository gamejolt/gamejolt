import { RouteRecordRaw } from 'vue-router';

export const routeDashCommunitiesAdd: RouteRecordRaw = {
	name: 'dash.communities.add',
	path: 'add',
	component: () => import(/* webpackChunkName: "routeDashCommunitiesAdd" */ './add.vue'),
};
