import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountChatCommands: RouteRecordRaw = {
	name: 'dash.account.chat-commands',
	path: 'chat-commands',
	component: () => import('./RouteDashAccountChatCommands.vue'),
};
