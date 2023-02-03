import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountChatMods: RouteRecordRaw = {
	name: 'dash.account.chat-mods',
	path: 'chat-mods',
	component: () => import('./RouteDashAccountChatMods.vue'),
};
