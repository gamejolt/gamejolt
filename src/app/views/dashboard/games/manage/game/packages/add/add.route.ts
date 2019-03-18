import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGamePackagesAdd: RouteConfig = {
	name: 'dash.games.manage.game.packages.add',
	path: 'packages/add',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGamePackagesAdd" */ './add.vue'),
};
