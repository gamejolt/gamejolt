import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameLinkedAccounts: RouteConfig = {
	name: 'dash.games.manage.game.linked-accounts',
	path: 'linked-accounts',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameLinkedAccounts" */ './linked-accounts'),
};
