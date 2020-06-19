import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditModerators: RouteConfig = {
	name: 'communities.view.edit.moderators',
	path: 'moderators',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './moderators.vue'),
};
