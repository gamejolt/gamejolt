import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameLinkedAccountsLinkCallback: RouteConfig = {
	name: 'dash.games.manage.game.linked-accounts.link-callback',
	path: 'linked-accounts/link-callback/:provider',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameLinkedAccountsLinkCallback" */ './link-callback'),
};
