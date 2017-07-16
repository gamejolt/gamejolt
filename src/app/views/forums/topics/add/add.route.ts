import VueRouter from 'vue-router';


export const routeForumsTopicsAdd: VueRouter.RouteConfig = {
	name: 'forums.topics.add',
	path: '/f/:channel/create',
	props: true,
	component: () => import('./add'),
};
