import VueRouter from 'vue-router';

export const routeLandingGameApi: VueRouter.RouteConfig = {
	name: 'landing.game-api',
	path: '/game-api',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingGameApi" */ './game-api'),
};
