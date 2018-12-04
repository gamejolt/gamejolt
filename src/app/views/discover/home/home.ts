import View from '!view!./home.html';
import { Component } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { State } from 'vuex-class';
import { Ads, AdSettingsContainer } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { AppGameGridPlaceholder } from '../../../components/game/grid/placeholder/placeholder';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import { AppDiscoverHomeBanner } from './_banner/banner';
import { AppDiscoverHomeTags } from './_tags/tags';

export interface DiscoverRow {
	title: string;
	desc?: string;
	url: Location;
	eventLabel: string;
	games: string;
}

@View
@Component({
	name: 'RouteDiscoverHome',
	components: {
		AppDiscoverHomeBanner,
		AppDiscoverHomeTags,
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
	games: Game[] = [];

	routeCreated() {
		Meta.title = null;

		const adSettings = new AdSettingsContainer();
		adSettings.adUnit = 'homepage';
		Ads.setPageSettings(adSettings);
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
		this.games = Game.populate($payload.games);
	}

	routeDestroyed() {
		Ads.releasePageSettings();
	}
}
