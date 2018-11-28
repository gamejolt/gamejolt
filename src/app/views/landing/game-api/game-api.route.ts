import { RouteConfig } from 'vue-router';

export const routeLandingGameApi: RouteConfig = {
	name: 'landing.game-api',
	path: '/game-api',
	component: () => import(/* webpackChunkName: "routeLandingGameApi" */ './game-api'),
};
