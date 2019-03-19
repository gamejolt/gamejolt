import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import AppGameGridPlaceholder from '../../../components/game/grid/placeholder/placeholder.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import AppDiscoverHomeBanner from './_banner/banner.vue';
import AppDiscoverHomeCommunities from './_communities/communities.vue';
import AppDiscoverHomeTags from './_tags/tags.vue';

@Component({
	name: 'RouteDiscoverHome',
	components: {
		AppDiscoverHomeBanner,
		AppDiscoverHomeTags,
		AppDiscoverHomeCommunities,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppAuthJoin: AppAuthJoinLazy,
	},
	directives: {
		AppTrackEvent,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/discover'),
})
export default class RouteDiscoverHome extends BaseRouteComponent {
	@State
	app!: Store['app'];

	featuredItem: FeaturedItem | null = null;
	featuredCommunities: Community[] = [];
	games: Game[] = [];

	routeCreated() {
		Meta.title = null;
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
		if ($payload.isFollowingFeatured && this.featuredItem && this.featuredItem.game) {
			this.featuredItem!.game!.is_following = true;
		}

		this.featuredCommunities = Community.populate($payload.featuredCommunities);
		this.games = Game.populate($payload.games);
	}
}
