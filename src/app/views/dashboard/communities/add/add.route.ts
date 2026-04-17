import { RouteRecordRaw } from 'vue-router';

export const routeDashCommunitiesAdd: RouteRecordRaw = {
	name: 'dash.communities.add',
	path: 'add',
	component: () => import('~app/views/dashboard/communities/add/RouteDashCommunitiesAdd.vue'),
};
