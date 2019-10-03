import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesAdd: RouteConfig = {
	name: 'dash.communities.add',
	path: 'add',
	component: () => import(/* webpackChunkName: "routeDashCommunitiesAdd" */ './add.vue'),
};
