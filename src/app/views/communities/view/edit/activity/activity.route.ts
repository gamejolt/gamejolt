import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditActivity: RouteConfig = {
	name: 'communities.view.edit.activity',
	path: 'activity',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './activity.vue'),
};
