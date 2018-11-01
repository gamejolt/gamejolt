import View from '!view!./search.html';
import { AppPagination } from 'game-jolt-frontend-lib/components/pagination/pagination';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppExpand } from '../../../lib/gj-lib-client/components/expand/expand';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { number } from '../../../lib/gj-lib-client/vue/filters/number';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppSearch } from '../../components/search/search';
import { Search } from '../../components/search/search-service';
import { Store, store } from '../../store/index';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './search.store';
import './search.styl';

@View
@Component({
	name: 'RouteSearch',
	components: {
		AppPageHeader,
		AppExpand,
		AppSearch,
		AppPagination,
	},
	filters: {
		number,
	},
})
@WithRouteStore({
	store,
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
	created({ route }) {
		routeStore.commit('initStore', route);
	},
	destroyed() {
		routeStore.commit('destroyStore');
	},
})
export default class RouteSearch extends BaseRouteComponent {
	@State
	route!: Store['route'];

	@RouteStoreModule.Mutation
	initStore!: RouteStore['initStore'];

	@RouteStoreModule.Mutation
	destroyStore!: RouteStore['destroyStore'];

	@RouteStoreModule.State
	hasSearch!: RouteStore['hasSearch'];

	@RouteStoreModule.State
	query!: RouteStore['query'];

	@RouteStoreModule.State
	searchPayload!: RouteStore['searchPayload'];

	readonly Screen = Screen;
	readonly Search = Search;
	readonly Scroll = Scroll;

	get routeTitle() {
		if (this.route.query.q) {
			return this.$gettextInterpolate('Search results for %{ query }', {
				query: this.route.query.q,
			});
		}
		return this.$gettext('search.page_title');
	}

	get noResults() {
		return (
			this.hasSearch &&
			!this.searchPayload.gamesCount &&
			!this.searchPayload.usersCount &&
			!this.searchPayload.postsCount
		);
	}
}
