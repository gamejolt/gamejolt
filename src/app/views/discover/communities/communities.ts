import { Inject, Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import {
	AppPromotionStore,
	AppPromotionStoreKey,
	setAppPromotionCohort,
} from '../../../../utils/mobile-app';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityCardCreatePlaceholder from '../../../../_common/community/card-create-placeholder/card-create-placeholder.vue';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { Community } from '../../../../_common/community/community.model';
import { HistoryCache } from '../../../../_common/history/cache/cache.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../_common/scroll/inview/inview';
import { AppStore } from '../../../../_common/store/app-store';

const endpoint = '/web/discover/communities';
const InviewConfigLoadMore = new ScrollInviewConfig({ margin: `${Screen.height}px` });

const cacheKey = 'DiscoverCommunities';
interface CacheData {
	communities: Community[];
	page: number;
}

@Options({
	name: 'RouteDiscoverCommunities',
	components: {
		AppCommunityCard,
		AppLoading,
		AppScrollInview,
		AppCommunityCardCreatePlaceholder,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest(endpoint),
})
export default class RouteDiscoverCommunities extends BaseRouteComponent {
	@State app!: AppStore;

	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	communities: Community[] = [];
	page = 1;
	isLoading = false;
	hasMore = true;

	readonly inviewConfig = InviewConfigLoadMore;

	get routeTitle() {
		return this.$gettext(`Discover Communities`);
	}

	get isLoadingFirst() {
		return this.isRouteLoading;
	}

	get isLoadingMore() {
		return this.isLoading;
	}

	get showCreateCommunity() {
		return (!this.app.user || !!this.app.user.can_create_communities) && !this.hasMore;
	}

	routeCreated() {
		const cachedData = HistoryCache.get<CacheData>(this.$route, cacheKey);

		this.communities = cachedData?.data?.communities ?? [];
		this.page = cachedData?.data?.page ?? 1;
		this.isLoading = false;
		this.hasMore = true;

		setAppPromotionCohort(this.appPromotion, 'community');
	}

	routeResolved(payload: any) {
		const cachedData = HistoryCache.get<CacheData>(this.$route, cacheKey);
		if (cachedData?.data) {
			this.communities = cachedData.data.communities;
			this.page = cachedData.data.page;
		} else {
			this.processPayload(payload);
		}
	}

	async loadMore() {
		// Don't attempt to load more results if we're still loading,
		// or if a previous attempt for the same search string returned empty.
		if (this.isRouteLoading || this.isLoading || !this.hasMore) {
			return;
		}

		this.isLoading = true;
		++this.page;

		const payload = await Api.sendRequest(`${endpoint}?page=${this.page}`);
		this.processPayload(payload);

		this.isLoading = false;
	}

	private async processPayload(payload: any) {
		if (!payload?.communities?.length) {
			this.hasMore = false;
			return;
		}

		this.communities.push(...Community.populate(payload.communities));

		HistoryCache.store<CacheData>(
			this.$route,
			{ communities: this.communities, page: this.page },
			cacheKey
		);
	}
}
