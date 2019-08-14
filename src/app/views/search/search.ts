import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppExpand from '../../../_common/expand/expand.vue';
import { number } from '../../../_common/filters/number';
import AppPagination from '../../../_common/pagination/pagination.vue';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { WithRouteStore } from '../../../_common/route/route-store';
import { Screen } from '../../../_common/screen/screen-service';
import { Scroll } from '../../../_common/scroll/scroll.service';
import { Store, store } from '../../store/index';
import AppPageHeader from '../page-header/page-header.vue';
import { Search } from '../search/search-service';
import AppSearch from '../search/search.vue';
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
