import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameLinkedAccounts: RouteRecordRaw = {
	name: 'dash.games.manage.game.linked-accounts',
	path: 'linked-accounts',
	component: () =>
		import(
			/* webpackChunkName: "routeDashGamesManageGameLinkedAccounts" */ './linked-accounts.vue'
		),
};
