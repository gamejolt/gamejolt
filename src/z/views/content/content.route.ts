import { RouteConfig } from 'vue-router';

export const routeContent: RouteConfig = {
	name: 'content',
	path: '/z/content/:resource/:resourceId',
	component: () => import(/* webpackChunkName: "routeContent" */ './content.vue'),
};
