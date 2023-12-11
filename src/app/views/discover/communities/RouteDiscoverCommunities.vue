<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityCardCreatePlaceholder from '../../../../_common/community/card-create-placeholder/AppCommunityCardCreatePlaceholder.vue';
import AppCommunityCard from '../../../../_common/community/card/AppCommunityCard.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import { HistoryCache } from '../../../../_common/history/cache/cache.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';

const endpoint = '/web/discover/communities';
const InviewConfigLoadMore = new ScrollInviewConfig({ margin: `${Screen.height}px` });

const cacheKey = 'DiscoverCommunities';
interface CacheData {
	communities: CommunityModel[];
	page: number;
}

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
		resolver: () => Api.sendRequest(endpoint),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();
const appPromotionStore = useAppPromotionStore();

const communities = ref<CommunityModel[]>([]);
const page = ref(1);
const isLoading = ref(false);
const hasMore = ref(true);
const route = useRoute();

const showCreateCommunity = toRef(
	() => (!user.value || !!user.value.can_create_communities) && !hasMore.value
);

async function loadMore() {
	// Don't attempt to load more results if we're still loading,
	// or if a previous attempt for the same search string returned empty.
	if (isRouteLoading.value || isLoading.value || !hasMore.value) {
		return;
	}

	isLoading.value = true;
	++page.value;

	const payload = await Api.sendRequest(`${endpoint}?page=${page.value}`);
	processPayload(payload);

	isLoading.value = false;
}

async function processPayload(payload: any) {
	if (!payload?.communities?.length) {
		hasMore.value = false;
		return;
	}

	communities.value.push(...CommunityModel.populate(payload.communities));

	HistoryCache.store<CacheData>(
		route,
		{ communities: communities.value, page: page.value },
		cacheKey
	);
}

const { isLoading: isRouteLoading } = createAppRoute({
	routeTitle: computed(() => $gettext(`Discover Communities`)),
	onInit() {
		const cachedData = HistoryCache.get<CacheData>(route, cacheKey);

		communities.value = cachedData?.communities ?? [];
		page.value = cachedData?.page ?? 1;
		isLoading.value = false;
		hasMore.value = true;

		setAppPromotionCohort(appPromotionStore, 'community');
	},
	onResolved({ payload }) {
		const cachedData = HistoryCache.get<CacheData>(route, cacheKey);
		if (cachedData) {
			communities.value = cachedData.communities;
			page.value = cachedData.page;
		} else {
			processPayload(payload);
		}
	},
});
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<h1 class="text-center">
					{{ $gettext(`Browse Communities`) }}
				</h1>

				<br />
				<br />

				<AppLoading v-if="isRouteLoading" centered />
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
							v-if="!isLoading"
							:config="InviewConfigLoadMore"
							@inview="loadMore()"
						/>
						<AppLoading v-else class="-loading-more" centered />
					</template>
				</template>

				<div v-if="showCreateCommunity" class="row -create">
					<div class="page-cut" />

					<h2 class="-lead text-center">
						{{ $gettext(`Can't find your dream community?`) }}
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
