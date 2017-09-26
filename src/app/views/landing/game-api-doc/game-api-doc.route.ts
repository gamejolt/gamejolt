import VueRouter from 'vue-router';

const routeLandingGameApiDocContent: VueRouter.RouteConfig = {
	name: 'landing.game-api-doc',
	path: ':path*',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeLandingGameApiDoc" */ './game-api-doc-content'),
};

export const routeLandingGameApiDoc: VueRouter.RouteConfig = {
	path: '/game-api/doc',
	component: () => import(/* webpackChunkName: "routeLandingGameApiDoc" */ './game-api-doc'),
	children: [routeLandingGameApiDocContent],
};
