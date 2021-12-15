import { Component } from 'vue-property-decorator';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { configGuestHome } from '../../../../_common/config/config.service';
import { Environment } from '../../../../_common/environment/environment.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import { Store } from '../../../store';
import AppHomeDefault from './home-default.vue';
import AppHomeSlider from './home-slider.vue';

@Component({
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
	@AppState
	user!: Store['app'];

	@AppState
	userBootstrapped!: AppStore['userBootstrapped'];

	featuredItem: FeaturedItem | null = null;
	featuredCommunities: Community[] = [];
	featuredFireside: Fireside | null = null;
	heroPosts: FiresidePost[] = [];

	split: null | 'default' | 'hero' = null;

	routeCreated() {
		Meta.setTitle(null);

		this.$watch(
			() => this.userBootstrapped,
			userBootstrapped => {
				if (!userBootstrapped) {
					return;
				}

				// If we bootstrapped and are logged out, then we've decided to
				// show this as a split test. If we're logged in, we always use
				// the default, since it's used as the discover page.
				if (!this.user) {
					trackExperimentEngagement(configGuestHome);
					this.split = configGuestHome.value;
					this.split = 'hero';
				} else {
					this.split = 'default';
				}
			},
			{ immediate: true }
		);
	}

	routeResolved($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
		Meta.fb.image = Meta.twitter.image = require('../../../img/social/social-share-header.png');
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
