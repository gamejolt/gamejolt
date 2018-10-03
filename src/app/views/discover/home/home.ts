import View from '!view!./home.html?style=./home.styl';
import { Component } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { State } from 'vuex-class';
import { Ads, AdSettingsContainer } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppScrollScroller } from '../../../../lib/gj-lib-client/components/scroll/scroller/scroller';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Channels } from '../../../components/channel/channels-service';
import { AppChannelThumbnail } from '../../../components/channel/thumbnail/thumbnail';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { AppGameGridPlaceholder } from '../../../components/game/grid/placeholder/placeholder';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import { AppDiscoverHomeBanner } from './_banner/banner';

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
		AppJolticon,
		AppNavTabList,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppChannelThumbnail,
		AppAuthJoin: AppAuthJoinLazy,
		AppDiscoverHomeBanner,
		AppScrollScroller,
	},
	directives: {
		AppTrackEvent,
		AppAuthRequired,
	},
})
export default class RouteDiscoverHome extends BaseRouteComponent {
	@State
	app!: Store['app'];

	isLoaded = false;
	channels: any[] = [];
	featuredItem: FeaturedItem | null = null;
	games: Game[] = [];

	@RouteResolve({ cache: true, lazy: true })
	routeResolve() {
		return Api.sendRequest('/web/discover');
	}

	routeInit() {
		Meta.title = null;

		const adSettings = new AdSettingsContainer();
		adSettings.adUnit = 'homepage';
		Ads.setPageSettings(adSettings);
	}

	routed($payload: any) {
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
		this.games = Game.populate($payload.games);

		const channels = [
			'action',
			'horror',
			'adventure',
			'fangame',
			'rpg',
			'multiplayer',
			'platformer',
			'survival',
			'retro',
			'shooter',
			'vr',
			'strategy-sim',
			'fnaf',
		];

		this.channels = [];
		for (const channel of channels) {
			const info = Channels.channels.find(i => i.id === channel);
			if (info) {
				this.channels.push(info);
			}
		}

		this.isLoaded = true;
	}

	routeDestroy() {
		Ads.releasePageSettings();
	}
}
