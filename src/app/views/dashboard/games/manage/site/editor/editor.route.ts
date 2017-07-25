import VueRouter from 'vue-router';

export const routeDashGamesManageSiteEditor: VueRouter.RouteConfig = {
	name: 'dash.games.manage.site.editor',
	path: 'editor/:tab(theme|content)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageSiteEditor" */ './editor'),
};
