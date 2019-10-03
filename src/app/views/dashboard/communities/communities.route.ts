import { RouteConfig } from 'vue-router';
import { routeDashCommunitiesAdd } from './add/add.route';

export const routeDashCommunities: RouteConfig = {
	path: 'communities',
	component: () => import(/* webpackChunkName: "routeDashCommunities" */ './communities'),
	children: [routeDashCommunitiesAdd],
};
