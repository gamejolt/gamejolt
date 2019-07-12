import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditTags: RouteConfig = {
	name: 'communities.view.edit.tags',
	path: '/c/:path/edit/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEditTags" */ './tags.vue'),
};
