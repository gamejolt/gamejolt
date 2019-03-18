import { RouteConfig } from 'vue-router';

export const routeSentKey: RouteConfig = {
	name: 'sent-key',
	path: '/claim/sent',
	component: () => import(/* webpackChunkName: "routeSentKey" */ './sent-key.vue'),
};
