<script lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

import { FeaturedItemModel } from '~app/components/featured-item/featured-item.model';
import socialImage from '~app/img/social/social-share-header.png';
import AppHomeDefault from '~app/views/discover/home/AppHomeDefault.vue';
import AppHomeSlider from '~app/views/discover/home/AppHomeSlider.vue';
import { Api } from '~common/api/api.service';
import { CommunityModel } from '~common/community/community.model';
import { Environment } from '~common/environment/environment.service';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { HistoryCache } from '~common/history/cache/cache.service';
import AppLoading from '~common/loading/AppLoading.vue';
import { Meta } from '~common/meta/meta-service';
import { RealmModel } from '~common/realm/realm-model';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { arrayShuffle } from '~utils/array';

const CachedCreatorsKey = 'HomeCreators';
const CachedRealmsKey = 'HomeRealms';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: 'never',
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
	},
});
</script>

<template>
	<div v-if="!userBootstrapped" class="-load-container">
		<AppLoading stationary hide-label />
	</div>

	<AppHomeDefault
		v-if="user"
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
