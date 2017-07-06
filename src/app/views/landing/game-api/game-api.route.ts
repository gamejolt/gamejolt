import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeLandingGameApi: VueRouter.RouteConfig = {
	name: 'landing.game-api',
	path: '/game-api',
	props: true,
	component: () => asyncComponentLoader(import('./game-api')),
};
