import { Component, Watch } from 'vue-property-decorator';
import { sleep } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { Community } from '../../../../_common/community/community.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../_common/scroll/inview/inview';

const endpoint = '/web/discover/communities';

@Component({
	name: 'RouteDiscoverCommunities',
	components: {
		AppCommunityCard,
		AppLoading,
		AppScrollInview,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: { query: ['q'] },
	resolver: ({ route }) => Api.sendRequest(`${endpoint}?q=${route.query.q || ''}`),
})
export default class RouteDiscoverCommunities extends BaseRouteComponent {
	searchText = '';
	communities: Community[] = [];
	page = 1;

	isLoading = false;
	hasMore = true;

	private nextSearchId = 0;

	$refs!: {
		inview: AppScrollInview;
	};

	get isLoadingFirst() {
		return this.isRouteLoading;
	}

	get isLoadingMore() {
		return this.isLoading;
	}

	get loadMoreMargin() {
		return `${Screen.height * 2}px`;
	}

	routeCreated() {
		this.searchText = (this.$route.query.q || '') as string;
		this.communities = [];
		this.page = 1;
		this.isLoading = false;
		this.hasMore = true;
	}

	routeResolved(payload: any) {
		// Set the communities to empty because the processSearchResults
		// appends instead of sets, and routeResolved is called twice - once for cache,
		// and one for the actual results, resulting in duplicate entries.
		this.communities = [];

		this.processSearchResults(payload);
	}

	@Watch('searchText')
	async onSearchTextChanged() {
		const searchId = ++this.nextSearchId;

		// Debounce
		await sleep(500);
		if (searchId !== this.nextSearchId) {
			return;
		}

		this.$router.replace({
			name: 'discover.communities',
			query: { q: this.searchText || undefined },
		});
	}

	onScrollLoadMore() {
		// Don't attempt to load more results if we're still loading,
		// or if a previous attempt for the same search string returned empty.
		if (this.isRouteLoading || this.isLoading || !this.hasMore) {
			return;
		}

		this.page++;
		this.nextSearchId++;
		this.sendSearch(this.nextSearchId, this.searchText);
	}

	async sendSearch(searchId: number, searchText: string) {
		this.isLoading = true;

		const url = `${endpoint}?q=${encodeURIComponent(searchText)}&page=${this.page}`;
		const result = await Api.sendRequest(url, null, {
			detach: true,
		});

		// Abort if a new search was already made while this was sent.
		if (searchId !== this.nextSearchId) {
			return;
		}

		this.isLoading = false;

		this.processSearchResults(result);
	}

	private async processSearchResults(payload: any) {
		if (!payload || !Array.isArray(payload.communities) || payload.communities.length === 0) {
			this.hasMore = false;
			return;
		}

		this.communities.push(...Community.populate(payload.communities));

		// inview won't emit if the scroll didn't go out of view.
		// We have to check if we still have room to load more entries manually then.
		await this.$nextTick();
		if (this.$refs.inview.inView) {
			this.onScrollLoadMore();
		}
	}
}
