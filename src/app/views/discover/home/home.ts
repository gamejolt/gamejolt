import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./home.html';

import { BeforeRouteEnter } from '../../../../lib/gj-lib-client/utils/router';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppState } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import { AppGenreList } from '../../../components/genre/list/list';
import { AppChannelThumbnail } from '../../../components/channel/thumbnail/thumbnail';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';

interface DiscoverSection
{
	title: string;
	url: string;
	eventLabel: string;
	items: any[];
}

@View
@Component({
	name: 'route-discover-home',
	components: {
		AppNavTabList,
		AppGameGrid,
		AppGenreList,
		AppChannelThumbnail,
		AppAuthJoin,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteDiscoverHome extends Vue
{
	@State app: AppState;

	isLoaded = false;
	featuredItems: FeaturedItem[] = [];
	featuredGames: Game[] = [];
	hotGames: Game[] = [];
	paidGames: Game[] = [];
	bestGames: Game[] = [];
	recommendedGames: Game[] = [];
	hotDevlogs: Game[] = [];

	channels: any[] = [];

	firesidePosts: FiresidePost[] = [];

	isDevlogsExpanded = false;

	discoverSections: DiscoverSection[] = [];
	chosenSection: DiscoverSection | null = null;

	@BeforeRouteEnter( { cache: true } )
	beforeRoute()
	{
		return Api.sendRequest( '/web/discover' );
	}

	routed()
	{
		this.isLoaded = true;

		Meta.title = null;

		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;
		Meta.fb.image = Meta.twitter.image = require( '../../../img/social/social-share-header.png' );
		Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

		Meta.microdata = {
			'@context': 'http://schema.org',
			'@type': 'WebSite',
			'url': 'http://gamejolt.com/',
			'name': 'Game Jolt',
			'potentialAction': {
				'@type': 'SearchAction',
				'target': 'http://gamejolt.com/search?q={search_term_string}',
				'query-input': 'required name=search_term_string'
			},
		};

		this.featuredItems = FeaturedItem.populate( this.$payload.featuredGames );
		this.featuredGames = this.featuredItems.map( ( item ) => item.game );

		this.hotGames = Game.populate( this.$payload.hotGames );
		this.paidGames = Game.populate( this.$payload.paidGames );
		this.bestGames = Game.populate( this.$payload.bestGames );
		this.recommendedGames = Game.populate( this.$payload.recommendedGames );
		this.hotDevlogs = Game.populate( this.$payload.hotDevlogs );

		this.channels = this.$payload.channels;

		this.firesidePosts = FiresidePost.populate( this.$payload.firesidePosts );

		const bestSection = {
			title: this.$gettext( 'Best Games' ),
			smallTitle: this.$gettext( 'Best' ),
			url: this.$router.resolve( {
				name: 'discover.games.list._fetch',
				params: { section: 'best' },
			} ).href,
			eventLabel: 'best-games',
			items: this.bestGames,
		};

		const hotSection = {
			title: this.$gettext( 'Hot Games' ),
			smallTitle: this.$gettext( 'Hot' ),
			url: this.$router.resolve( {
				name: 'discover.games.list._fetch',
				params: { section: 'hot' },
			} ).href,
			eventLabel: 'hot-games',
			items: this.hotGames,
		};

		if ( this.app.user ) {
			const recommendedSection = {
				title: this.$gettext( 'Recommended Games' ),
				smallTitle: this.$gettext( 'Recommended' ),
				url: this.$router.resolve( {
					name: 'library.collection.recommended',
					params: { id: this.app.user.username },
				} ).href,
				eventLabel: 'recommended-games',
				items: this.recommendedGames,
			};

			this.discoverSections = [ hotSection, recommendedSection, bestSection ];
		}
		else {
			this.discoverSections = [ hotSection, bestSection ];
		}

		this.chosenSection = this.discoverSections[0];
	}

	changeSection( sectionIndex: number )
	{
		this.chosenSection = this.discoverSections[ sectionIndex ];
	}
}
