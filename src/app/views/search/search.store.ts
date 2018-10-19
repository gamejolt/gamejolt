import { Ads, AdSettingsContainer } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { Route } from 'vue-router';
import { namespace } from 'vuex-class';
import {
	NamespaceVuexStore,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../../lib/gj-lib-client/utils/vuex';
import { SearchPayload } from '../../components/search/payload-service';
import { Search } from '../../components/search/search-service';
import { store } from '../../store';

type RouteActions = {};

type RouteMutations = {
	initStore: Route;
	destroyStore: void;
	processPayload: { payload: SearchPayload; route: Route };
};

export const RouteStoreName = 'searchRoute';
export const RouteStoreModule = namespace(RouteStoreName);
export const routeStore = NamespaceVuexStore<RouteStore, RouteActions, RouteMutations>(
	store,
	RouteStoreName
);

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, RouteActions, RouteMutations> {
	query = '';
	adSettings: AdSettingsContainer = null as any;
	searchPayload: SearchPayload = {} as any;

	get hasSearch() {
		return !!this.query;
	}

	@VuexMutation
	initStore(route: RouteMutations['initStore']) {
		// We store our own version of the search query and sync back to it on
		// form submission.
		this.query = route.query.q;

		this.adSettings = new AdSettingsContainer();
		this.adSettings.adUnit = 'search';
		Ads.setPageSettings(this.adSettings);
	}

	@VuexMutation
	destroyStore() {
		Ads.releasePageSettings();
	}

	@VuexMutation
	processPayload({ payload, route }: RouteMutations['processPayload']) {
		// Disable ads for adult searches.
		if (payload.isAdultSearch) {
			this.adSettings.isPageDisabled = true;
		}

		this.query = '';

		if (!route.query.q) {
			this.searchPayload = new SearchPayload('all', {});
			return;
		}

		this.query = route.query.q;
		this.searchPayload = payload;

		// We sync the query to the search service so that all places get
		// updated with the new query.
		Search.query = this.query;
	}
}
