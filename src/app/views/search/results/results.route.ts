import { RouteConfig } from 'vue-router';
import { hasSearchPage3ColSplitTest } from '../../../components/split-test/split-test-service';

export const routeSearchResults: RouteConfig = {
	name: 'search.results',
	path: '/search',
	props: true,
	component: () => {
		return hasSearchPage3ColSplitTest()
			? import(/* webpackChunkName: "routeSearch3Col" */ './results-3col')
			: import(/* webpackChunkName: "routeSearch" */ './results');
	},
};
