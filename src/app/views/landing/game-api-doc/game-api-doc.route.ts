import { RouteConfig } from 'vue-router';

const routeLandingGameApiDocContent: RouteConfig = {
	name: 'landing.game-api-doc',
	path: ':path*',
	component: () =>
		import(/* webpackChunkName: "routeLandingGameApiDoc" */ './game-api-doc-content'),
};

export const routeLandingGameApiDoc: RouteConfig = {
	path: '/game-api/doc',
	component: () => import(/* webpackChunkName: "routeLandingGameApiDoc" */ './game-api-doc'),
	children: [routeLandingGameApiDocContent],
};
