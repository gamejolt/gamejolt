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
import { Channels } from '../../../components/channel/channels-service';
import { splitHomeCollapsedVariation } from '../../../components/split-test/split-test-service';
import { AppVideoEmbed } from '../../../../lib/gj-lib-client/components/video/embed/embed';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

export interface DiscoverSection {
	title: string;
	smallTitle: string;
	url: string;
	eventLabel: string;
	games: string;
}

@View
@Component({
	name: 'RouteDiscoverHome',
	components: {
		AppVideoEmbed,
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
	variation = 0;

	bear = '';
	bears = [
		`ʕ·ᴥ·　ʔ`,
		`ʕ•ᴥ•ʔ`,
		`ʕ　·ᴥ·ʔ`,
		`ʕ •ᴥ•ʔゝ☆`,
		`＼ʕ •ᴥ•ʔ／`,
		`＼ʕ •ᴥ•ʔ＼`,
		`／ʕ •ᴥ•ʔ／`,
		`ʕ ˵• ₒ •˵ ʔ`,
		`ʕ •ₒ• ʔ`,
		`ʕง•ᴥ•ʔง`,
		`ᕕʕ •ₒ• ʔ୨`,
		`ʕ　·ᴥʔ`,
		`ʕ　·ᴥ·ʔ`,
		`ʕ·ᴥ·　ʔ`,
		`ʕᴥ·　ʔ`,
		`ʕ •ᴥ•ʔ`,
		`,ʕ ﾟ ● ﾟʔ`,
		`Σʕﾟᴥﾟﾉʔﾉ`,
		`“φʕ•ᴥ•oʔ`,
		`ʕ*ﾉᴥﾉʔ`,
		`ᕦʕ •ᴥ•ʔᕤ`,
		`┏ʕ •ᴥ•ʔ┛`,
		`ʅʕ•ᴥ•ʔʃ`,
		`ʕノ)ᴥ(ヾʔ`,
		`ʕ/　·ᴥ·ʔ/`,
		`ʕ╯• ⊱ •╰ʔ`,
		`ʕ☞ᴥ ☜ʔ`,
		`ʕ　·ᴥ·ʔ`,
		`ʕ·ᴥ·　ʔ`,
		`ʕ·ᴥ·˵　ʔ`,
		`ʕ　˵·ᴥ·ʔ`,
		`ʕ♡˙ᴥ˙♡ʔ`,
		`ʕ≧ᴥ≦ʔ`,
		`╲ʕ·ᴥ·　╲ʔ`,
		`ʕ•ᴥ•ʔ`,
		`ʕ￫ᴥ￩　ʔ`,
		`ʕ – ᴥ – ʔ`,
		`ᶘ ͡°ᴥ͡°ᶅ`,
		`ᶘಠᴥಠᶅ`,
		`ʕノ•ᴥ•ʔノ`,
		`ʕ – ㉨ – ʔ`,
		`ʕ ̿–㉨ ̿– ʔ`,
		`(ó㉨ò)ﾉ♡`,
		`ᕦᶘ ᵒ㉨ᵒᶅᕤ`,
		`ᶘ ᵒ㉨ᵒᶅ`,
		`ʕ•㉨•ʔ`,
		`ʕ •㉨• ʔ`,
		`ʕ≧㉨≦ʔ`,
		`ʕʘ̅͜ʘ̅ʔ`,
		`ʕっ˘ڡ˘ςʔ`,
		`ʕ – o – ʔ`,
		`ʕ – _ – ʔ`,
	];

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
		const featuredSection: DiscoverSection = {
			title: this.$gettext('Featured Games'),
			smallTitle: this.$gettext('Featured'),
			url: this.$router.resolve({
				name: 'discover.games.list._fetch',
				params: { section: 'featured' },
			}).href,
			eventLabel: 'featured-games',
			// We actually show hot games in the featured tab.
			games: 'hot',
		};

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

		let sections: DiscoverSection[] = [];
		if (this.isLoaded && this.app.user) {
			const recommendedSection = {
				title: this.$gettext('Your Daily Mix'),
				smallTitle: this.$gettext('Your Daily Mix'),
				url: this.$router.resolve({
					name: 'library.collection.recommended',
					params: { id: this.app.user.username },
				}).href,
				eventLabel: 'daily-mix',
				games: 'recommended',
			};

			sections = [hotSection, recommendedSection, bestSection];
		} else {
			sections = [hotSection, bestSection];
		}

		if (this.variation === 2) {
			sections.unshift(featuredSection);
		}

		return sections;
	}

	routeInit() {
		if (!this.chosenSection) {
			this.chosenSection = this.discoverSections[0];
		}

		if (!this.bear) {
			this.bear = this.bears[Math.floor(Math.random() * this.bears.length)];
		}
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

		this.variation = Math.max(splitHomeCollapsedVariation(this.$route, this.$payload), 0);
		this.chosenSection = this.discoverSections[0];

		this.featuredItems = FeaturedItem.populate(this.$payload.featuredGames);
		this.games.featured = this.featuredItems.map(item => item.game);
		this.games.hot = Game.populate(this.$payload.hotGames);
		this.games.best = Game.populate(this.$payload.bestGames);
		this.games.recommended = Game.populate(this.$payload.recommendedGames);

		const channels =
			this.variation === 0
				? this.$payload.channels
				: [
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
	}

	changeSection(sectionIndex: number) {
		this.chosenSection = this.discoverSections[sectionIndex];
	}
}
