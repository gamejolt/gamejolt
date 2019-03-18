import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameSettings: RouteConfig = {
	name: 'dash.games.manage.game.settings',
	path: 'settings',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameSettingsname" */ './settings.vue'),
};
