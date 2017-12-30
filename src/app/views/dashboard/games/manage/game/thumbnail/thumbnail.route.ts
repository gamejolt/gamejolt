import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameThumbnail: RouteConfig = {
	name: 'dash.games.manage.game.thumbnail',
	path: 'thumbnail',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameThumbnail" */ './thumbnail'),
};
