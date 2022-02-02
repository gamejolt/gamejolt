import { RouteRecordRaw } from 'vue-router';

const SectionRegex = 'featured|new|fresh|hot|best|worst';

export const routeDiscoverGamesListSection: RouteRecordRaw = {
	name: 'discover.games.list._fetch',
	path: `:section(${SectionRegex})?`,
	component: () => import('./RouteDiscoverGamesList.vue'),
};

export const routeDiscoverGamesListTag: RouteRecordRaw = {
	name: 'discover.games.list._fetch-tag',
	path: `:section(${SectionRegex})?/tag-:tag`,
	component: () => import('./RouteDiscoverGamesList.vue'),
};

export const routeDiscoverGamesListDate: RouteRecordRaw = {
	name: 'discover.games.list._fetch-date',
	path: `:section(by\\-date)/:date(\\d{4}\\-\\d{2}\\-\\d{2})`,
	component: () => import('./RouteDiscoverGamesList.vue'),
};
