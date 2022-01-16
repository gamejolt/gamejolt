<script lang="ts">
import { Options } from 'vue-property-decorator';
import { arrayShuffle } from '../../../../../utils/array';
import { RouteLocationRedirect } from '../../../../../utils/router';
import { titleCase } from '../../../../../utils/string';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { formatDate } from '../../../../../_common/filters/date';
import { formatFuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import AppGameAddBanner from '../../../../../_common/game/add-banner/add-banner.vue';
import { HistoryCache } from '../../../../../_common/history/cache/cache.service';
import { Meta } from '../../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import {
	checkGameFilteringRoute,
	GameFilteringContainer,
} from '../../../../components/game/filtering/container';
import AppGameGrid from '../../../../components/game/grid/grid.vue';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import AppGameListing from '../../../../components/game/listing/listing.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import AppTagList from '../../../../components/tag/list/list.vue';
import { TagsInfo } from '../../../../components/tag/tags-info.service';

const listingKey = 'CachedListing';

@Options({
	name: 'RouteDiscoverGamesList',
	components: {
		AppPageHeader,
		AppTagList,
		AppGameListing,
		AppGameGrid,
		AppExpand,
		AppGameAddBanner,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	lazy: true,
	cache: true,
	async resolver({ route }) {
		const location = checkGameFilteringRoute(route);
		if (location) {
			return new RouteLocationRedirect(location);
		}

		const filtering = new GameFilteringContainer(route);
		return Api.sendRequest('/web/discover/games?' + filtering.getQueryString(route));
	},
})
export default class RouteDiscoverGamesList extends BaseRouteComponent {
	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	readonly Screen = Screen;

	get section(): string | undefined {
		return this.$route.params.section?.toLowerCase();
	}

	get tag(): string | undefined {
		return this.$route.params.tag?.toLowerCase();
	}

	get spotlight() {
		if (this.tag) {
			return TagsInfo.tags.find(i => i.id === this.tag)?.image;
		}
	}

	get spotlightSocial() {
		if (this.tag) {
			return TagsInfo.tags.find(i => i.id === this.tag)?.imageSocial;
		}
	}

	get date() {
		if (this.section === 'by-date') {
			return formatDate(new Date(this.$route.params.date), 'mediumDate');
		}
	}

	get routeTitle() {
		let title = this.listTitle;
		let onlyBrowser = false;

		if (this.filtering) {
			const browserFilters = this.filtering.getFilter('browser');
			const hasBrowserFilters = Array.isArray(browserFilters) && browserFilters.length > 0;

			const osFilters = this.filtering.getFilter('os');
			const hasOsFilters = Array.isArray(osFilters) && osFilters.length > 0;
			onlyBrowser =
				(hasBrowserFilters && !hasOsFilters) ||
				(hasOsFilters && osFilters.length === 1 && osFilters[0] === 'rom');
		}

		if (onlyBrowser) {
			title += ' - ' + this.$gettext('Play online');
		}

		return titleCase(title);
	}

	get listTitle() {
		if (this.section === 'worst') {
			// Excuse me with this?
			return 'Ṣ̢̖͇͈͙̹̦Y̱͍͉S̺̳̞͠Y̸̱͚̙͕̺̺ͅS͎̘̲͕̹̀ͅT͉͕̺̲ͅE͓̱̥̠̰̱͚M̪̙̪̥̹ͅ ͏̼̲̫̰E͇̺̩̼R͏̗͙Ŕ͖̦͕Ơ̰̱͖̗̯̞R҉̻̯̠͚';
		}

		if (this.date) {
			return this.$gettextInterpolate('Games published on %{ date }', {
				date: this.date,
			});
		}

		const onlyFree = this.filtering && this.filtering.getFilter('price') === 'free';

		const title = this.$gettextInterpolate('%{ listOf } %{ free } %{ gamesType }', {
			listOf: this.displayListOf,
			free: onlyFree ? this.$gettext('free') : '',
			gamesType: this.displayGamesType,
		});

		// Remove duplicate whitespaces (formed when a replacement ends up being an empty string)
		return title.replace(/\s+/g, ' ');
	}

	get displayListOf() {
		switch (this.section) {
			case 'hot':
				return this.$gettext('Find great');
			case 'best':
				return this.$gettext('Best');
			case 'new':
				return this.$gettext('Newest');
			default:
				return this.$gettext('Featured');
		}
	}

	get displayGamesType() {
		if (!this.tag) {
			return this.$gettext('games');
		}

		switch (this.tag) {
			case 'horror':
				return this.$gettext('scary horror games');
			case 'fangame':
				return this.$gettext('fan games');
			case 'fnaf':
				return this.$gettext(`Five Nights at Freddy's (FNaF) games`);
			case 'fnf':
				return this.$gettext(`Friday Night Funkin' (FNF) games`);
			case 'scifi':
				return this.$gettext('science fiction games');
			case 'retro':
				return this.$gettext('retro and old-school games');
			case 'pointnclick':
				return this.$gettext('point and click games');
			case 'altgame':
				return this.$gettext('alt games');
			case 'roguelike':
				return this.$gettext('roguelike games');
			default:
				return this.$gettextInterpolate(`%{ category } games`, {
					category: this.tag,
				});
		}
	}

	/**
	 * This function doesn't translate, but it's only used for meta tags
	 * currently.
	 */
	get listDescription() {
		if (!this.section) {
			return this.$gettextInterpolate(
				`Browse our featured list of %{ gamesType }, curated by Game Jolt.`,
				{
					gamesType: this.displayGamesType,
				}
			);
		} else if (this.section === 'new') {
			return this.$gettextInterpolate(`Find the newest %{ gamesType } on Game Jolt.`, {
				gamesType: this.displayGamesType,
			});
		} else if (this.section === 'hot') {
			return this.$gettextInterpolate(
				`Find the hottest trending %{ gamesType } on Game Jolt.`,
				{
					gamesType: this.displayGamesType,
				}
			);
		} else if (this.section === 'best') {
			return this.$gettextInterpolate(
				`Find the best %{ gamesType }, top rated by our community on Game Jolt.`,
				{
					gamesType: this.displayGamesType,
				}
			);
		} else if (this.section === 'worst') {
			return this.$gettextInterpolate(
				`The worst %{ gamesType } decided by the Game Jolt community.`,
				{ gamesType: this.displayGamesType }
			);
		}

		return '';
	}

	get routeMeta() {
		if (!this.listing) {
			return this.listDescription;
		}

		if (!Array.isArray(this.listing.games) || this.listing.games.length === 0) {
			return this.listDescription;
		}

		const count = formatFuzzynumber(this.listing.gamesCount);
		const gameTitles = arrayShuffle(this.listing.games.slice())
			.slice(0, 5)
			.map(game => game.title)
			.join(', ');

		const descriptionStats = this.$gettextInterpolate(
			'Discover over %{ count } games like %{ gameTitles }',
			{
				count,
				gameTitles,
			}
		);

		return `${this.listDescription} ${descriptionStats}`;
	}

	routeCreated() {
		if (!this.filtering || !this.listing) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.filtering.isPersistent = true;

			// A stub listing to show before we load.
			this.listing =
				HistoryCache.get(this.$route, listingKey)?.data ?? new GameListingContainer();
		}

		this.filtering.init(this.$route);
	}

	routeResolved($payload: any) {
		this.filtering!.init(this.$route);

		const cachedListing = HistoryCache.get(this.$route, listingKey);
		if (cachedListing?.data) {
			this.listing = cachedListing.data;
		} else {
			this.listing = new GameListingContainer();
			this.listing.processPayload(this.$route, $payload);
			HistoryCache.store(this.$route, this.listing, listingKey);
		}

		if ($payload) {
			Meta.description = this.routeMeta;

			// We use the listDescription and not Meta.description for fb and twitter because they are shorter and more "embeddable"
			Meta.fb.title = this.routeTitle;
			Meta.fb.description = this.listDescription;
			Meta.twitter.title = this.routeTitle;
			Meta.twitter.description = this.listDescription;

			if (this.spotlightSocial) {
				Meta.twitter.image = this.spotlightSocial;
				Meta.twitter.card = 'summary';
				Meta.fb.image = this.spotlightSocial;
			}
		}
	}

	async loadMore() {
		if (!this.filtering || !this.listing || this.listing.isLoadingMore) {
			return;
		}

		this.listing.isLoadingMore = true;

		const page = this.listing.currentPage + 1;
		const payload = await Api.sendRequest(
			'/web/discover/games?' + this.filtering.getQueryString(this.$route, { page })
		);
		this.listing.processPagePayload(page, payload);
		this.listing.isLoadingMore = false;
	}
}
</script>

<template>
	<div>
		<section v-if="section !== 'by-date'" class="fill-offset">
			<div class="container-xl">
				<h2 class="text-center">
					<translate>Browse Games</translate>
				</h2>
			</div>
			<app-tag-list />
		</section>

		<app-game-add-banner v-if="Screen.isDesktop" />

		<app-game-listing
			v-if="listing"
			:listing="listing"
			:filtering="filtering"
			include-featured-section
			:hide-section-nav="section === 'by-date'"
			:is-loading="isRouteLoading"
			infinite
			@load="loadMore"
		>
			<div v-if="section === 'new'" class="alert alert-info anim-fade-in-enlarge">
				<translate>
					Newly added games are not moderated, curated, or vetted by the community. You
					can find a goldmine of undiscovered talent or you may see some of the scariest
					shit of your life.
				</translate>
			</div>

			<app-game-grid :games="listing.games" :show-ads="true" event-label="browse-games" />
		</app-game-listing>
	</div>
</template>

<style lang="stylus" scoped>
$-spotlight-size = 58px

.-list-desc
	margin-top: 4px

@media $media-sm-up
	.-spotlight
		float: left
		width: $-spotlight-size
		height: $-spotlight-size

	.-has-spotlight .-header-content
		margin-left: $-spotlight-size + $grid-gutter-width
</style>
