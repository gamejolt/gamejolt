import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./search.html';
import './search.styl';

import { AppExpand } from '../../../lib/gj-lib-client/components/expand/expand';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppSearch } from '../../components/search/search';
import { Search } from '../../components/search/search-service';
import { SearchHistory } from '../../components/search/history/history-service';
import { makeObservableService } from '../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { number } from '../../../lib/gj-lib-client/vue/filters/number';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';
import { Store } from '../../store/index';
import { Ads } from '../../../lib/gj-lib-client/components/ad/ads.service';

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
	@State route: Store['route'];

	query = '';
	showPagination = false;
	noResults = false;
	payload: any = {};

	Screen = makeObservableService(Screen);
	Search = makeObservableService(Search);

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

		Ads.setAdUnit('search');
	}

	// Child routes emit an event that calls this.
	processPayload(payload: any) {
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
		SearchHistory.record(this.query);

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
