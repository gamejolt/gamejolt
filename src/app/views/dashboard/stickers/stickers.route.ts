import { RouteConfig } from 'vue-router';
import { routeDashStickersOverview } from './overview/overview.route';

export const routeDashStickers: RouteConfig = {
	path: 'stickers',
	component: () => import(/* webpackChunkName: "routeDashStickers" */ './stickers.vue'),
	children: [routeDashStickersOverview],
};
