import { RouteRecordRaw } from 'vue-router';

export const routeRetrieve: RouteRecordRaw = {
	name: 'retrieve',
	path: '/claim/:input([gb]{1}\\-[0-9a-zA-Z]+)?',
	component: () => import('~claim/views/retrieve/RouteRetrieve.vue'),
};
