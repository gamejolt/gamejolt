import { RouteConfig } from 'vue-router';

const SectionRegex = 'featured|new|fresh|hot|best|worst';
const CategoryRegex =
	'arcade|action|adventure|rpg|strategy\\-sim|platformer|shooter|puzzle|sports|other';
const DateRegex = '\\d{4}\\-\\d{2}\\-\\d{2}';

export const routeDiscoverGamesListSection: RouteConfig = {
	name: 'discover.games.list._fetch',
	path: `:section(${SectionRegex})?`,
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesList" */ './list'),
};

export const routeDiscoverGamesListCategory: RouteConfig = {
	name: 'discover.games.list._fetch-category',
	path: `:section(${SectionRegex})?/:category(${CategoryRegex})`,
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesList" */ './list'),
};

export const routeDiscoverGamesListDate: RouteConfig = {
	name: 'discover.games.list._fetch-date',
	path: `:section(by\\-date)/:date(${DateRegex})(\:)?:endDate(${DateRegex})?`,
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesList" */ './list'),
};
