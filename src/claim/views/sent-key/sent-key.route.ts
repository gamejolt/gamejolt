import { RouteConfig } from 'vue-router';

export const routeSentKey: RouteConfig = {
	name: 'sent-key',
	path: '/claim/sent',
	props: true,
	component: () => import(/* webpackChunkName: "routeSentKey" */ './sent-key'),
};
