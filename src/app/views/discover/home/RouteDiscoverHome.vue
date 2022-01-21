<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { configGuestHome, configSaveOverride } from '../../../../_common/config/config.service';
import { Environment } from '../../../../_common/environment/environment.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import socialImage from '../../../img/social/social-share-header.png';
import AppHomeDefault from './AppHomeDefault.vue';
import AppHomeSlider from './AppHomeSlider.vue';

@Options({
	name: 'RouteDiscoverHome',
	components: {
		AppHomeDefault,
		AppHomeSlider,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/discover'),
})
export default class RouteDiscoverHome extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	get userBootstrapped() {
		return this.commonStore.userBootstrapped;
	}

	featuredItem: FeaturedItem | null = null;
	featuredCommunities: Community[] = [];
	featuredFireside: Fireside | null = null;
	heroPosts: FiresidePost[] = [];

	split: null | 'default' | 'hero' = null;

	get routeTitle() {
		if (this.user) {
			return this.$gettext(`Explore`);
		}
		return null;
	}

	routeCreated() {
		console.log('route home created');
		Meta.title = null;

		this.$watch(
			() => this.userBootstrapped,
			(userBootstrapped: boolean) => {
				if (!userBootstrapped) {
					return;
				}

				// If we bootstrapped and are logged out, then we've decided to
				// show this as a split test. If we're logged in, we always use
				// the default, since it's used as the discover page.
				if (!this.user) {
					// If they came in through an ad, we want to force them into
					// the "hero" split test and save it into their session so
					// that it always shows when they go back.
					if (this.$route.query['utm_campaign'] === 'pmf_communities') {
						configSaveOverride(configGuestHome, 'hero');
					}

					trackExperimentEngagement(configGuestHome);
					this.split = configGuestHome.value;
				} else {
					this.split = 'default';
				}
			},
			{ immediate: true }
		);
	}

	routeResolved($payload: any) {
		console.log('route home resolved: ', $payload);
		console.log('route home resolved end');

		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
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

		this.featuredItem = $payload.featuredItem ? new FeaturedItem($payload.featuredItem) : null;

		if ($payload.isFollowingFeatured && this.featuredItem) {
			if (this.featuredItem.game) {
				this.featuredItem.game.is_following = true;
			} else if (this.featuredItem.community) {
				this.featuredItem.community.is_member = true;
			}
		}

		this.featuredCommunities = Community.populate($payload.communities);
		this.featuredFireside = $payload.featuredFireside
			? new Fireside($payload.featuredFireside)
			: null;

		this.heroPosts = FiresidePost.populate<FiresidePost>($payload.heroPosts).filter(
			i => i.hasMedia || i.hasVideo
		);
	}
}
</script>

<template>
	<app-home-default
		v-if="split === 'default'"
		:is-bootstrapped="isRouteBootstrapped"
		:featured-item="featuredItem"
		:featured-communities="featuredCommunities"
		:featured-fireside="featuredFireside"
	/>
	<app-home-slider v-else-if="split === 'hero'" :posts="heroPosts" />
</template>
