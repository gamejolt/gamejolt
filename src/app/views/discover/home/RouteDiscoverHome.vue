<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { arrayShuffle } from '../../../../utils/array';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { configGuestHomeDiscover } from '../../../../_common/config/config.service';
import { Environment } from '../../../../_common/environment/environment.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { HistoryCache } from '../../../../_common/history/cache/cache.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { Realm } from '../../../../_common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import socialImage from '../../../img/social/social-share-header.png';
import AppHomeDefault from './AppHomeDefault.vue';
import AppHomeSlider from './AppHomeSlider.vue';

const CachedCreatorsKey = 'HomeCreators';

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

const featuredItem = ref<FeaturedItem>();
const featuredCommunities = ref<Community[]>([]);
const featuredFireside = ref<Fireside>();
const featuredRealms = ref<Realm[]>([]);
const heroPosts = ref<FiresidePost[]>([]);
const creatorPosts = ref<FiresidePost[]>([]);

const homeView = computed(() => {
	if (user.value) {
		return 'discover';
	}

	return configGuestHomeDiscover.value ? 'discover' : 'slider';
});

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
			? new FeaturedItem(payload.featuredItem)
			: undefined;

		if (payload.isFollowingFeatured && featuredItem.value) {
			if (featuredItem.value.game) {
				featuredItem.value.game.is_following = true;
			} else if (featuredItem.value.community) {
				featuredItem.value.community.is_member = true;
			}
		}

		featuredCommunities.value = Community.populate(payload.communities);
		featuredFireside.value = payload.featuredFireside
			? new Fireside(payload.featuredFireside)
			: undefined;
		featuredRealms.value = Realm.populate(payload.featuredRealms);

		heroPosts.value = FiresidePost.populate<FiresidePost>(payload.heroPosts).filter(
			i => i.hasMedia || i.hasVideo
		);

		const cachedListing = HistoryCache.get(route, CachedCreatorsKey);
		if (cachedListing) {
			creatorPosts.value = cachedListing;
		} else {
			creatorPosts.value = payload.creatorPosts
				? arrayShuffle(FiresidePost.populate(payload.creatorPosts))
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
	<AppHomeSlider v-if="homeView === 'slider'" :posts="heroPosts" />
	<AppHomeDefault
		v-else
		:is-bootstrapped="isBootstrapped"
		:featured-item="featuredItem"
		:featured-communities="featuredCommunities"
		:featured-fireside="featuredFireside"
		:featured-realms="featuredRealms"
		:creator-posts="creatorPosts"
	/>
</template>

<style lang="stylus" scoped>
.-load-container
	height: 100vh
	display: flex
	align-items: center
	justify-content: center
</style>
