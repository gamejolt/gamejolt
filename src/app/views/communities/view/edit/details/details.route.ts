import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditDetails: RouteConfig = {
	name: 'communities.view.edit.details',
	path: '/c/:path/edit/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './details.vue'),
};
