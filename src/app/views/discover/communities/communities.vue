<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityCardCreatePlaceholder from '../../../../_common/community/card-create-placeholder/card-create-placeholder.vue';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { Community } from '../../../../_common/community/community.model';
import { HistoryCache } from '../../../../_common/history/cache/cache.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { shallowSetup } from '../../../../utils/vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';

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
		AppShellPageBackdrop,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest(endpoint),
})
export default class RouteDiscoverCommunities extends LegacyRouteComponent {
	commonStore = setup(() => useCommonStore());
	appPromotionStore = shallowSetup(() => useAppPromotionStore());

	get app() {
		return this.commonStore;
	}

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

		this.communities = cachedData?.communities ?? [];
		this.page = cachedData?.page ?? 1;
		this.isLoading = false;
		this.hasMore = true;

		setAppPromotionCohort(this.appPromotionStore, 'community');
	}

	routeResolved(payload: any) {
		const cachedData = HistoryCache.get<CacheData>(this.$route, cacheKey);
		if (cachedData) {
			this.communities = cachedData.communities;
			this.page = cachedData.page;
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
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<h1 class="text-center">
					<AppTranslate>Browse Communities</AppTranslate>
				</h1>

				<br />
				<br />

				<AppLoading v-if="isLoadingFirst" centered />
				<template v-else>
					<div class="row">
						<div
							v-for="community of communities"
							:key="community.id"
							class="-item col-sm-6 col-md-4 col-lg-3 anim-fade-in"
						>
							<AppCommunityCard :community="community" elevate />
						</div>
					</div>

					<template v-if="hasMore">
						<AppScrollInview
							v-if="!isLoadingMore"
							:config="inviewConfig"
							@inview="loadMore()"
						/>
						<AppLoading v-else class="-loading-more" centered />
					</template>
				</template>

				<div v-if="showCreateCommunity" class="row -create">
					<div class="page-cut" />

					<h2 class="-lead text-center">
						<AppTranslate>Can't find your dream community?</AppTranslate>
					</h2>

					<AppCommunityCardCreatePlaceholder style="margin: 0 auto" />
				</div>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-item
	margin-bottom: $line-height-computed * 1.5

	@media $media-sm
		&:nth-child(2n+1)
			clear: both

	@media $media-md
		&:nth-child(3n+1)
			clear: both

	@media $media-lg
		&:nth-child(4n+1)
			clear: both

.-loading-more
	clear: both

.-create
	.-lead
		margin: $line-height-computed 0
</style>
