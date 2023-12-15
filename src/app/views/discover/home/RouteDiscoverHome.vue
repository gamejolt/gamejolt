<script lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { CommunityModel } from '../../../../_common/community/community.model';
import { configGuestHomeDiscover } from '../../../../_common/config/config.service';
import { Environment } from '../../../../_common/environment/environment.service';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import { HistoryCache } from '../../../../_common/history/cache/cache.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { RealmModel } from '../../../../_common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { arrayShuffle } from '../../../../utils/array';
import { FeaturedItemModel } from '../../../components/featured-item/featured-item.model';
import socialImage from '../../../img/social/social-share-header.png';
import AppHomeDefault from './AppHomeDefault.vue';
import AppHomeSlider from './AppHomeSlider.vue';

const CachedCreatorsKey = 'HomeCreators';
const CachedRealmsKey = 'HomeRealms';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
		resolver: () => Api.sendRequest('/web/discover'),
	}),
};
</script>

<script lang="ts" setup>
const { user, userBootstrapped } = useCommonStore();
const route = useRoute();

const featuredItem = ref<FeaturedItemModel>();
const featuredCommunities = ref<CommunityModel[]>([]);
const featuredRealms = ref<RealmModel[]>([]);

const heroPosts = shallowRef<FiresidePostModel[]>([]);
const creatorPosts = shallowRef<FiresidePostModel[]>([]);

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => (user.value ? $gettext(`Discover`) : null)),
	onInit() {
		creatorPosts.value = HistoryCache.get(route, CachedCreatorsKey) ?? [];
	},
	onResolved({ payload }) {
		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb;
		Meta.twitter = payload.twitter;
		Meta.fb.image = Meta.twitter.image = socialImage;
		Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

		Meta.microdata = {
			'@context': 'http://schema.org',
			'@type': 'WebSite',
			url: 'https://gamejolt.com/',
			name: 'Game Jolt',
			potentialAction: {
				'@type': 'SearchAction',
				target: 'https://gamejolt.com/search?q={search_term_string}',
				'query-input': 'required name=search_term_string',
			},
		};

		featuredItem.value = payload.featuredItem
			? new FeaturedItemModel(payload.featuredItem)
			: undefined;

		if (payload.isFollowingFeatured && featuredItem.value) {
			if (featuredItem.value.game) {
				featuredItem.value.game.is_following = true;
			} else if (featuredItem.value.community) {
				featuredItem.value.community.is_member = true;
			}
		}

		featuredCommunities.value = CommunityModel.populate(payload.communities);

		heroPosts.value = FiresidePostModel.populate<FiresidePostModel>(payload.heroPosts).filter(
			i => i.hasMedia || i.hasVideo
		);

		// Realms might get randomized on backend, so freeze it when going back.
		const cachedRealms = HistoryCache.get(route, CachedRealmsKey);
		if (cachedRealms) {
			featuredRealms.value = cachedRealms;
		} else {
			featuredRealms.value = RealmModel.populate(payload.featuredRealms);
			HistoryCache.store(route, featuredRealms.value, CachedRealmsKey);
		}

		const cachedCreators = HistoryCache.get(route, CachedCreatorsKey);
		if (cachedCreators) {
			creatorPosts.value = cachedCreators;
		} else {
			creatorPosts.value = payload.creatorPosts
				? arrayShuffle(FiresidePostModel.populate(payload.creatorPosts))
				: [];
			HistoryCache.store(route, creatorPosts.value, CachedCreatorsKey);
		}

		trackExperimentEngagement(configGuestHomeDiscover);
	},
});
</script>

<template>
	<div v-if="!userBootstrapped" class="-load-container">
		<AppLoading stationary hide-label />
	</div>

	<AppHomeDefault
		v-if="user || configGuestHomeDiscover.value"
		:is-bootstrapped="isBootstrapped"
		:featured-item="featuredItem"
		:featured-communities="featuredCommunities"
		:featured-realms="featuredRealms"
		:creator-posts="creatorPosts"
	/>
	<AppHomeSlider v-else :posts="heroPosts" />
</template>

<style lang="stylus" scoped>
.-load-container
	height: 100vh
	display: flex
	align-items: center
	justify-content: center
</style>
