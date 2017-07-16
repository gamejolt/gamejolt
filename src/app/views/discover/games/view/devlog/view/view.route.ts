import VueRouter from 'vue-router';

export const routeDiscoverGamesViewDevlogView: VueRouter.RouteConfig = {
	name: 'discover.games.view.devlog.view',
	path: 'devlog/:postSlug',
	props: true,
	component: () => import('./view'),
};
