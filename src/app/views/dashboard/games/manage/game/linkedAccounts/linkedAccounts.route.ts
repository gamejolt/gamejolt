import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameLinkedAccounts: RouteConfig = {
	name: 'dash.games.manage.game.linkedAccounts',
	path: 'linked-accounts',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameLinkedAccounts" */ './linkedAccounts'),
};
