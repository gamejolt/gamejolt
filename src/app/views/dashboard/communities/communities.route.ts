import { RouteRecordRaw } from 'vue-router';
import { routeDashCommunitiesAdd } from './add/add.route';

export const routeDashCommunities: RouteRecordRaw = {
	path: 'communities',
	component: () => import('./RouteDashCommunities.vue'),
	children: [routeDashCommunitiesAdd],
};
