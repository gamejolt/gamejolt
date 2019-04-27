import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppPagination from 'game-jolt-frontend-lib/components/pagination/pagination.vue';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { WithRouteStore } from 'game-jolt-frontend-lib/components/route/route-store';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppPageHeader from '../../components/page-header/page-header.vue';
import { Search } from '../../components/search/search-service';
import AppSearch from '../../components/search/search.vue';
import { Store, store } from '../../store/index';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './search.store';
import './search.styl';

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
