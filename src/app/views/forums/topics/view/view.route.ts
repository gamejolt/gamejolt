import VueRouter from 'vue-router';

export const routeForumsTopicsView: VueRouter.RouteConfig = {
	name: 'forums.topics.view',
	path: '/f/:slug/:id(\\d+)',
	props: true,
	component: () => import('./view'),
};
