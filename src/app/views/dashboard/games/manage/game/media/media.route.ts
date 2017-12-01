import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameMedia: RouteConfig = {
	name: 'dash.games.manage.game.media',
	path: 'media',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameMedia" */ './media'),
};
