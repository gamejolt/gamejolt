import VueRouter from 'vue-router';

export const routeAuthJoin: VueRouter.RouteConfig = {
	name: 'auth.join',
	path: 'join',
	props: true,
	component: () => import('./join'),
};
