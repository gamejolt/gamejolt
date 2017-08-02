import { Component } from 'vue-property-decorator';
import * as View from '!view!./search.html';
import './search.styl';

import { AppExpand } from '../../../lib/gj-lib-client/components/expand/expand';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppSearch } from '../../components/search/search';
import { Search } from '../../components/search/search-service';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { SearchHistory } from '../../components/search/history/history-service';
import { makeObservableService } from '../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { number } from '../../../lib/gj-lib-client/vue/filters/number';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

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
	query = '';
	showPagination = false;
	noResults = false;
	payload: any = {};

	Screen = makeObservableService(Screen);
	Search = makeObservableService(Search);

	routeInit() {
		// We store our own version of the search query and sync back to it on form submission.
		this.query = Search.query;
	}

	// Child routes emit an event that calls this.
	processPayload(payload: any) {
		this.query = '';
		this.showPagination = false;
		this.payload = {};
		this.noResults = false;

		if (!this.$route.query.q) {
			Meta.title = this.$gettext('search.page_title');
			return;
		}

		Meta.title = this.$gettextInterpolate('Search results for %{ query }', {
			query: this.$route.query.q,
		});

		this.query = this.$route.query.q;

		console.log('search view', this.query);

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
