import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditDetails: RouteConfig = {
	name: 'communities.view.edit.details',
	path: '',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './details.vue'),
};
