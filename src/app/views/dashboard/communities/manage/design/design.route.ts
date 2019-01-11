import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesManageDesign: RouteConfig = {
	name: 'dash.communities.manage.design',
	path: 'design',
	component: () => import(/* webpackChunkName: "routeDashCommunitiesManageDesign" */ './design'),
};
