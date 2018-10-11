import View from '!view!./search.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Ads, AdSettingsContainer } from '../../../lib/gj-lib-client/components/ad/ads.service';
import { AppExpand } from '../../../lib/gj-lib-client/components/expand/expand';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { number } from '../../../lib/gj-lib-client/vue/filters/number';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppSearch } from '../../components/search/search';
import { Search } from '../../components/search/search-service';
import { Store } from '../../store/index';
import './search.styl';

@View
@Component({
	name: 'RouteSearch',
	components: {
		AppPageHeader,
		AppExpand,
		AppSearch,
	},
	filters: {
		number,
	},
})
export default class RouteSearch extends BaseRouteComponent {
	@State
	route!: Store['route'];

	query = '';
	showPagination = false;
	noResults = false;
	payload: any = {};
	adSettings: AdSettingsContainer = null as any;

	readonly Screen = Screen;
	readonly Search = Search;

	get routeTitle() {
		if (this.route.query.q) {
			return this.$gettextInterpolate('Search results for %{ query }', {
				query: this.route.query.q,
			});
		}
		return this.$gettext('search.page_title');
	}

	routeInit() {
		// We store our own version of the search query and sync back to it on form submission.
		this.query = Search.query;

		this.adSettings = new AdSettingsContainer();
		this.adSettings.adUnit = 'search';
		Ads.setPageSettings(this.adSettings);
	}

	routeDestroy() {
		Ads.releasePageSettings();
	}

	// Child routes emit an event that calls this.
	processPayload(payload: any) {
		// Disable ads for adult searches.
		if (payload.isAdultSearch) {
			this.adSettings.isPageDisabled = true;
		}

		this.query = '';
		this.showPagination = false;
		this.payload = {};
		this.noResults = false;

		if (!this.route.query.q) {
			return;
		}

		this.query = this.route.query.q;

		// We sync the query to the search service so that all places get updated with the new query.
		// We also record the search history since it was an explicit search request.
		Search.query = this.query;

		this.payload = payload;
		this.showPagination = this.payload.type !== 'all';

		if (typeof this.payload.perPage === 'string') {
			this.payload.perPage = parseInt(this.payload.perPage, 10);
		}

		if (!payload.gamesCount && !payload.usersCount && !payload.devlogsCount) {
			this.noResults = true;
		} else if (payload.devlogsCount > 0) {
			this.payload.devlogsTrimmed = payload.devlogs.slice(0, 4);
		}
	}
}
