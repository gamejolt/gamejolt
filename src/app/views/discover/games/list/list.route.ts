import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

const SectionRegex = 'featured|new|fresh|hot|best|worst';
const CategoryRegex = 'arcade|action|adventure|rpg|strategy\\-sim|platformer|shooter|puzzle|sports|other';
const DateRegex = '\\d{4}\\-\\d{2}\\-\\d{2}';

export const routeDiscoverGamesListSection: VueRouter.RouteConfig = {
	name: 'discover.games.list._fetch',
	path: `:section(${SectionRegex})?`,
	props: true,
	component: () => asyncComponentLoader( $import( './list' ) ),
};

export const routeDiscoverGamesListCategory: VueRouter.RouteConfig = {
	name: 'discover.games.list._fetch-category',
	path: `:section(${SectionRegex})?/:category(${CategoryRegex})`,
	props: true,
	component: () => asyncComponentLoader( $import( './list' ) ),
};

export const routeDiscoverGamesListDate: VueRouter.RouteConfig = {
	name: 'discover.games.list._fetch-date',
	path: `:section(by\\-date)/:date(${DateRegex})(\:)?:endDate(${DateRegex})?`,
	props: true,
	component: () => asyncComponentLoader( $import( './list' ) ),
};
