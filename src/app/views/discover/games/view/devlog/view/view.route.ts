import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverGamesViewDevlogView: RouteRecordRaw = {
	name: 'discover.games.view.devlog.view',
	path: 'devlog/:postSlug',
	redirect: '/p/:postSlug',
};
