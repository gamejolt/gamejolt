import VueRouter from 'vue-router';

export const routeLegalTerms: VueRouter.RouteConfig = {
	name: 'legal.terms',
	path: '/terms',
	props: true,
	component: () => import('./terms'),
};
