import VueRouter from 'vue-router';


export const routeStyleguide: VueRouter.RouteConfig = {
	name: 'styleguide',
	path: '/styleguide',
	props: true,
	component: () => import('./styleguide'),
};
