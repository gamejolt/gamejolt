import { RouteConfig } from 'vue-router';
import { routeDashCommunitiesAdd } from './add/add.route';
import { routeDashCommunitiesManage } from './manage/manage.route';

export const routeDashCommunities: RouteConfig = {
	path: 'communities',
	component: () => import(/* webpackChunkName: "routeDashCommunities" */ './communities'),
	children: [routeDashCommunitiesAdd, routeDashCommunitiesManage],
};
