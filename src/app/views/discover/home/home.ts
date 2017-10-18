import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./home.html?style=./home.styl';

import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import { AppChannelThumbnail } from '../../../components/channel/thumbnail/thumbnail';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppGameGridPlaceholder } from '../../../components/game/grid/placeholder/placeholder';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { Store } from '../../../store/index';
import { AppAdPlacement } from '../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Channels } from '../../../components/channel/channels-service';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { HalloweenMonster } from '../../../../lib/gj-lib-client/components/halloween-monster/halloween-monster.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

export interface DiscoverRow {
	title: string;
	desc?: string;
	url: string;
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
		AppAdPlacement,
		AppAuthJoin: AppAuthJoinLazy,
	},
	directives: {
		AppTrackEvent,
		AppAuthRequired,
	},
})
export default class RouteDiscoverHome extends BaseRouteComponent {
	@State app: Store['app'];

	isLoaded = false;
	channels: any[] = [];

	games: { [k: string]: Game[] } = {
		featured: [],
		hot: [],
		best: [],
		recommended: [],
	};

	get rows() {
		const rows: DiscoverRow[] = [];

		rows.push({
			title: this.$gettext('Featured'),
			url: this.$router.resolve({
				name: 'discover.games.list._fetch',
				params: { section: 'featured' },
			}).href,
			eventLabel: 'featured-games',
			games: 'featured',
		});

		if (this.isLoaded && this.app.user) {
			rows.push({
				title: this.$gettext('Recommended'),
				desc: this.$gettext(`based on your history`),
				url: this.$router.resolve({
					name: 'library.collection.recommended',
					params: { id: this.app.user.username },
				}).href,
				eventLabel: 'recommended',
				games: 'recommended',
			});
		}

		rows.push({
			title: this.$gettext('Hot Games'),
			desc: this.$gettext(`new stuff that people are enjoying`),
			url: this.$router.resolve({
				name: 'discover.games.list._fetch',
				params: { section: null as any },
			}).href,
			eventLabel: 'hot-games',
			games: 'hot',
		});

		rows.push({
			title: this.$gettext('Top Games'),
			url: this.$router.resolve({
				name: 'discover.games.list._fetch',
				params: { section: 'best' },
			}).href,
			eventLabel: 'best-games',
			games: 'best',
		});

		return rows;
	}

	@RouteResolve({ cache: true })
	routeResolve() {
		return Api.sendRequest('/web/discover');
	}

	routeInit() {
		Meta.title = null;
		Ads.setAdUnit('homepage');
	}

	routed() {
		this.isLoaded = true;

		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;
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

		const featuredItems = FeaturedItem.populate(this.$payload.featuredGames);
		this.games.featured = featuredItems.map(item => item.game);
		this.games.hot = Game.populate(this.$payload.hotGames);
		this.games.best = Game.populate(this.$payload.bestGames);
		this.games.recommended = Game.populate(this.$payload.recommendedGames);

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

		HalloweenMonster.add(
			new HalloweenMonster({
				id: 190,
				user_level: 0,
				seed: '73nqFm4GiQ83840380',
				type: 'vampire',
			})
		);

		// if (this.$payload.halloweenMonster) {
		// 	const monster = new HalloweenMonster(this.$payload.halloweenMonster);
		// 	HalloweenMonster.add(monster);
		// }
	}
}
