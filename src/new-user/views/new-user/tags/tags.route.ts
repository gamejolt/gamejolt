import { RouteConfig } from 'vue-router';

export const routeNewUserTags: RouteConfig = {
	name: 'new-user.tags',
	path: 'tags',
	component: () => import(/* webpackChunkName: "routeNewUserTags" */ './tags'),
};
