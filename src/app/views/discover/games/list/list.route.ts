import { RouteConfig } from 'vue-router';

const SectionRegex = 'featured|new|fresh|hot|best|worst';
const DateRegex = '\\d{4}\\-\\d{2}\\-\\d{2}';

export const routeDiscoverGamesListSection: RouteConfig = {
	name: 'discover.games.list._fetch',
	path: `:section(${SectionRegex})?`,
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesList" */ './list'),
};

export const routeDiscoverGamesListTag: RouteConfig = {
	name: 'discover.games.list._fetch-tag',
	path: `:section(${SectionRegex})?/tag-:tag`,
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesList" */ './list'),
};

export const routeDiscoverGamesListDate: RouteConfig = {
	name: 'discover.games.list._fetch-date',
	path: `:section(by\\-date)/:date(${DateRegex})(\:)?:endDate(${DateRegex})?`,
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesList" */ './list'),
};
