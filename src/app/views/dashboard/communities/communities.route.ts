import { RouteRecordRaw } from 'vue-router';

import { routeDashCommunitiesAdd } from '~app/views/dashboard/communities/add/add.route';

export const routeDashCommunities: RouteRecordRaw = {
	path: 'communities',
	component: () => import('~app/views/dashboard/communities/RouteDashCommunities.vue'),
	children: [routeDashCommunitiesAdd],
};
