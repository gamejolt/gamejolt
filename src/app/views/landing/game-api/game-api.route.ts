import { RouteConfig } from 'vue-router';

export const routeLandingGameApi: RouteConfig = {
	name: 'landing.game-api',
	path: '/game-api',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingGameApi" */ './game-api'),
};
