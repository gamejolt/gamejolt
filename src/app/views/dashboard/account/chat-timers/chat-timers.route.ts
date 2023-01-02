import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountChatTimers: RouteRecordRaw = {
	name: 'dash.account.chat-timers',
	path: 'chat-timers',
	component: () => import('./RouteDashAccountChatTimers.vue'),
};
