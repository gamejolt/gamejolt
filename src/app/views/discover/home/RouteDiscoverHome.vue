<script lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { configGuestHome, configSaveOverride } from '../../../../_common/config/config.service';
import { Environment } from '../../../../_common/environment/environment.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute } from '../../../../_common/route/route-composition';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import socialImage from '../../../img/social/social-share-header.png';
import AppHomeDefault from './AppHomeDefault.vue';
import AppHomeSlider from './AppHomeSlider.vue';

export default defineComponent({
	name: 'RouteDiscoverHome',
	resolveRoute: {
		cache: true,
		lazy: true,
		deps: {},
		resolver: () => Api.sendRequest('/web/discover'),
	},
});
</script>

<script lang="ts" setup>
const route = useRoute();
const { user, userBootstrapped } = useCommonStore();

const featuredItem = ref<FeaturedItem>();
const featuredCommunities = ref<Community[]>([]);
const featuredFireside = ref<Fireside>();
const heroPosts = ref<FiresidePost[]>([]);
const split = ref<'default' | 'hero'>();

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => (user.value ? $gettext(`Explore`) : null)),
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

		heroPosts.value = FiresidePost.populate<FiresidePost>(payload.heroPosts).filter(
			i => i.hasMedia || i.hasVideo
		);
	},
});

watch(
	userBootstrapped,
	(userBootstrapped: boolean) => {
		if (!userBootstrapped) {
			return;
		}

		// If we bootstrapped and are logged out, then we've decided to
		// show this as a split test. If we're logged in, we always use
		// the default, since it's used as the discover page.
		if (!user.value) {
			// If they came in through an ad, we want to force them into
			// the "hero" split test and save it into their session so
			// that it always shows when they go back.
			if (route.query['utm_campaign'] === 'pmf_communities') {
				configSaveOverride(configGuestHome, 'hero');
			}

			trackExperimentEngagement(configGuestHome);
			split.value = configGuestHome.value;
		} else {
			split.value = 'default';
		}
	},
	{ immediate: true }
);
</script>

<template>
	<AppHomeDefault
		v-if="split === 'default'"
		:is-bootstrapped="isBootstrapped"
		:featured-item="featuredItem"
		:featured-communities="featuredCommunities"
		:featured-fireside="featuredFireside"
	/>
	<AppHomeSlider v-else-if="split === 'hero'" :posts="heroPosts" />
</template>
