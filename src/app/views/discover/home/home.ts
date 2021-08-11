import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { configDiscoverCommunityChunks } from '../../../../_common/config/config.service';
import { Environment } from '../../../../_common/environment/environment.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import AppDiscoverHomeBanner from './_banner/banner.vue';
import AppDiscoverHomeCommunities from './_communities/communities.vue';

@Options({
	name: 'RouteDiscoverHome',
	components: {
		AppDiscoverHomeBanner,
		AppDiscoverHomeCommunities,
		AppAuthJoin: AppAuthJoinLazy,
		AppLoading,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/discover'),
})
export default class RouteDiscoverHome extends BaseRouteComponent {
	@State app!: Store['app'];

	featuredItem: FeaturedItem | null = null;
	featuredCommunities: Community[] = [];

	routeCreated() {
		Meta.setTitle(null);
	}

	routeResolved($payload: any) {
		trackExperimentEngagement(configDiscoverCommunityChunks);

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
	}
}
