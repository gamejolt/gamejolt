import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../_common/ad/ad-store';
import AppExpand from '../../../_common/expand/expand.vue';
import { number } from '../../../_common/filters/number';
import AppPagination from '../../../_common/pagination/pagination.vue';
import { BaseRouteComponent, WithRouteStore } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { Scroll } from '../../../_common/scroll/scroll.service';
import AppPageHeader from '../../components/page-header/page-header.vue';
import { Search } from '../../components/search/search-service';
import AppSearch from '../../components/search/search.vue';
import { store } from '../../store/index';
import { RouteStore, routeStore, RouteStoreModule, RouteStoreName } from './search.store';

@Options({
	name: 'RouteSearch',
	components: {
		AppPageHeader,
		AppExpand,
		AppSearch,
		AppPagination,
	},
})
@WithRouteStore({
	store,
	routeStoreName: RouteStoreName,
	routeStoreClass: RouteStore,
	created({ route }) {
		routeStore.commit('initStore', route);
	},
})
export default class RouteSearch extends BaseRouteComponent {
	ads = setup(() => useAdsController());

	@RouteStoreModule.State
	hasSearch!: RouteStore['hasSearch'];

	@RouteStoreModule.State
	query!: RouteStore['query'];

	@RouteStoreModule.State
	searchPayload!: RouteStore['searchPayload'];

	readonly Screen = Screen;
	readonly Search = Search;
	readonly Scroll = Scroll;
	readonly number = number;

	get routeTitle() {
		if (this.$route.query.q) {
			return this.$gettextInterpolate('Search results for %{ query }', {
				query: this.$route.query.q,
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

	routeCreated() {
		// Always disable ads for now, until we get better controls of when
		// adult content is shown in search.
		const adSettings = new AdSettingsContainer();
		adSettings.isPageDisabled = true;
		setPageAdsSettings(this.ads, adSettings);
	}

	routeDestroyed() {
		releasePageAdsSettings(this.ads);
	}
}
