import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { arrayShuffle } from 'game-jolt-frontend-lib/utils/array';
import { LocationRedirect } from 'game-jolt-frontend-lib/utils/router';
import { titleCase } from 'game-jolt-frontend-lib/utils/string';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import { fuzzynumber } from 'game-jolt-frontend-lib/vue/filters/fuzzynumber';
import { Component } from 'vue-property-decorator';
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

@Component({
	name: 'RouteDiscoverGamesList',
	components: {
		AppPageHeader,
		AppTagList,
		AppGameListing,
		AppGameGrid,
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
			return new LocationRedirect(location);
		}

		const filtering = new GameFilteringContainer(route);
		return Api.sendRequest('/web/discover/games?' + filtering.getQueryString(route));
	},
})
export default class RouteDiscoverGamesList extends BaseRouteComponent {
	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	get section() {
		return this.$route.params.section && this.$route.params.section.toLowerCase();
	}

	get tag() {
		return this.$route.params.tag && this.$route.params.tag.toLowerCase();
	}

	get spotlight() {
		if (this.tag) {
			const info = TagsInfo.tags.find(i => i.id === this.tag);
			return info && info.image;
		}
	}

	get spotlightSocial() {
		if (this.tag) {
			const info = TagsInfo.tags.find(i => i.id === this.tag);
			return info && info.imageSocial;
		}
	}

	get dateRange(): [string, string] | undefined {
		if (this.section === 'by-date' && this.$route.params.endDate) {
			return [
				date(new Date(this.$route.params.date), 'mediumDate'),
				date(new Date(this.$route.params.endDate), 'mediumDate'),
			];
		}
	}

	get date() {
		if (this.section === 'by-date' && !this.$route.params.endDate) {
			return date(new Date(this.$route.params.date), 'mediumDate');
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

		if (this.dateRange) {
			return this.$gettextInterpolate(
				'Games published between %{ dateStart } and %{ dateEnd }',
				{
					dateStart: this.dateRange[0],
					dateEnd: this.dateRange[1],
				}
			);
		}

		if (this.date) {
			return this.$gettextInterpolate('Games published on %{ date }', {
				date: this.date,
			});
		}

		let onlyFree = this.filtering && this.filtering.getFilter('price') === 'free';

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
			case 'featured':
				return this.$gettext('Featured');
			case 'best':
				return this.$gettext('Best');
			case 'new':
				return this.$gettext('Newest');
			default:
				return this.$gettext('Find great');
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
				`Find the hottest trending %{ gamesType } on Game Jolt.`,
				{
					gamesType: this.displayGamesType,
				}
			);
		} else if (this.section === 'new') {
			return this.$gettextInterpolate(
				// tslint:disable-next-line:max-line-length
				`Find the newest %{ gamesType } on Game Jolt.`,
				{ gamesType: this.displayGamesType }
			);
		} else if (this.section === 'featured') {
			return this.$gettextInterpolate(
				`Browse our featured list of %{ gamesType }, currated by Game Jolt.`,
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

		const count = fuzzynumber(this.listing.gamesCount);
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
		this.process();
	}

	routeResolved($payload: any) {
		if (this.listing && $payload) {
			this.listing.processPayload(this.$route, $payload);
			this.process();
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

	/**
	 * Gets called before the payload and after.
	 */
	process() {
		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.filtering.isPersistent = true;

			this.listing = new GameListingContainer(this.filtering);
		}

		this.filtering.init(this.$route);
	}
}
