import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameSettings: RouteConfig = {
	name: 'dash.games.manage.game.settings',
	path: 'settings',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameSettingsname" */ './settings'),
};
