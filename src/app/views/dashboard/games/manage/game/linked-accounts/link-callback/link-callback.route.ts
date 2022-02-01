import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameLinkedAccountsLinkCallback: RouteRecordRaw = {
	name: 'dash.games.manage.game.linked-accounts.link-callback',
	path: 'linked-accounts/link-callback/:provider',
	component: () => import('./link-callback'),
};
