import VueRouter from 'vue-router';

export const routeDashGamesManageGameThumbnail: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.thumbnail',
	path: 'thumbnail',
	props: true,
	component: () => import('./thumbnail'),
};
