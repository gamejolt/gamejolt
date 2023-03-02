import { RouteRecordRaw } from 'vue-router';
import { routeDashStickersEdit } from './edit/edit.route';
import { routeDashStickersView } from './view/view.route';

export const routeDashStickers: RouteRecordRaw = {
	path: 'stickers',
	component: () => import('./RouteDashStickers.vue'),
	children: [routeDashStickersView, routeDashStickersEdit],
};
