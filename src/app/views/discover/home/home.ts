import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./home.html?style=./home.styl';

import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import { AppGenreList } from '../../../components/genre/list/list';
import { AppChannelThumbnail } from '../../../components/channel/thumbnail/thumbnail';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppGameGridPlaceholder } from '../../../components/game/grid/placeholder/placeholder';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { Store } from '../../../store/index';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppAdPlacement } from '../../../../lib/gj-lib-client/components/ad/placement/placement';
import { AppAuthJoinLazy } from '../../../components/lazy';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

interface DiscoverSection {
	title: string;
	smallTitle: string;
	url: string;
	eventLabel: string;
	games: string;
}

@View
@Component({
	components: {
		AppJolticon,
		AppNavTabList,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppGenreList,
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
	chosenSection: DiscoverSection | null = null;
	featuredItems: FeaturedItem[] = [];
	channels: any[] = [];

	games: { [k: string]: Game[] } = {
		featured: [],
		hot: [],
		best: [],
		recommended: [],
	};

	Screen = makeObservableService(Screen);

	@RouteResolve({ lazy: true, cache: true })
	routeResolve() {
		return Api.sendRequest('/web/discover');
	}

	get discoverSections() {
		const bestSection: DiscoverSection = {
			title: this.$gettext('Best Games'),
			smallTitle: this.$gettext('Best'),
			url: this.$router.resolve({
				name: 'discover.games.list._fetch',
				params: { section: 'best' },
			}).href,
			eventLabel: 'best-games',
			games: 'best',
		};

		const hotSection: DiscoverSection = {
			title: this.$gettext('Hot Games'),
			smallTitle: this.$gettext('Hot'),
			url: this.$router.resolve({
				name: 'discover.games.list._fetch',
				params: { section: null as any },
			}).href,
			eventLabel: 'hot-games',
			games: 'hot',
		};

		if (this.isLoaded && this.app.user) {
			const recommendedSection = {
				title: this.$gettext('Recommended Games'),
				smallTitle: this.$gettext('Recommended'),
				url: this.$router.resolve({
					name: 'library.collection.recommended',
					params: { id: this.app.user.username },
				}).href,
				eventLabel: 'recommended-games',
				games: 'recommended',
			};

			return [hotSection, recommendedSection, bestSection];
		} else {
			return [hotSection, bestSection];
		}
	}

	routeInit() {
		this.chosenSection = this.discoverSections[0];
	}

	routed() {
		this.isLoaded = true;

		Meta.title = null;

		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;
		Meta.fb.image = Meta.twitter.image = require('../../../img/social/social-share-header.png');
		Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

		Meta.microdata = {
			'@context': 'http://schema.org',
			'@type': 'WebSite',
			url: 'http://gamejolt.com/',
			name: 'Game Jolt',
			potentialAction: {
				'@type': 'SearchAction',
				target: 'http://gamejolt.com/search?q={search_term_string}',
				'query-input': 'required name=search_term_string',
			},
		};

		this.featuredItems = FeaturedItem.populate(this.$payload.featuredGames);
		this.games.featured = this.featuredItems.map(item => item.game);
		this.games.hot = Game.populate(this.$payload.hotGames);
		this.games.best = Game.populate(this.$payload.bestGames);
		this.games.recommended = Game.populate(this.$payload.recommendedGames);

		this.channels = this.$payload.channels;
	}

	changeSection(sectionIndex: number) {
		this.chosenSection = this.discoverSections[sectionIndex];
	}
}
