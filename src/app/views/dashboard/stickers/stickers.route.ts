import { RouteConfig } from 'vue-router';
import { routeDashStickersCollect } from './collect/collect.route';
import { routeDashStickersOverview } from './overview/overview.route';

export const routeDashStickers: RouteConfig = {
	path: 'stickers',
	component: () => import(/* webpackChunkName: "routeDashStickers" */ './stickers.vue'),
	children: [routeDashStickersOverview, routeDashStickersCollect],
};
