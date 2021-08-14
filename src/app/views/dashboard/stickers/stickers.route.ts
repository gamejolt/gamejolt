import { RouteRecordRaw } from 'vue-router';

export const routeDashStickers: RouteRecordRaw = {
	name: 'dash.stickers',
	path: 'stickers',
	component: () => import(/* webpackChunkName: "routeDashStickers" */ './stickers.vue'),
};
