import View from '!view!./list.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Ads } from '../../../../../lib/gj-lib-client/components/ad/ads.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { LocationRedirect } from '../../../../../lib/gj-lib-client/utils/router';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import {
	checkGameFilteringRoute,
	GameFilteringContainer,
} from '../../../../components/game/filtering/container';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { AppGameListing } from '../../../../components/game/listing/listing';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import { AppGenreList } from '../../../../components/genre/list/list';
import { AppPageHeader } from '../../../../components/page-header/page-header';

@View
@Component({
	name: 'RouteDiscoverGamesList',
	components: {
		AppPageHeader,
		AppJolticon,
		AppGenreList,
		AppGameListing,
		AppGameGrid,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDiscoverGamesList extends BaseRouteComponent {
	@Prop(String)
	section?: string;
	@Prop(String)
	category?: string;

	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	pageTitle = '';
	descriptiveCategory = '';

	dateRange: [string, string] | null = null;
	date = '';

	translations: any = {
		'discover.categories.all': this.$gettext('discover.categories.all'),
		'discover.categories.arcade': this.$gettext('discover.categories.arcade'),
		'discover.categories.action': this.$gettext('discover.categories.action'),
		'discover.categories.adventure': this.$gettext('discover.categories.adventure'),
		'discover.categories.platformer': this.$gettext('discover.categories.platformer'),
		'discover.categories.puzzle': this.$gettext('discover.categories.puzzle'),
		'discover.categories.rpg': this.$gettext('discover.categories.rpg'),
		'discover.categories.shooter': this.$gettext('discover.categories.shooter'),
		'discover.categories.sports': this.$gettext('discover.categories.sports'),
		'discover.categories.strategy_sim': this.$gettext('discover.categories.strategy_sim'),
		'discover.categories.other': this.$gettext('discover.categories.other'),

		'games.list.page_title': this.$gettext('games.list.page_title'),
		'games.list.page_title_rpg': this.$gettext('games.list.page_title_rpg'),
		'games.list.page_title_other': this.$gettext('games.list.page_title_other'),

		'games.list.section_featured': this.$gettext('games.list.section_featured'),
		'games.list.section_new': this.$gettext('games.list.section_new'),
		'games.list.section_fresh': this.$gettext('games.list.section_fresh'),
		'games.list.section_hot': this.$gettext('games.list.section_hot'),
		'games.list.section_best': this.$gettext('games.list.section_best'),
	};

	@RouteResolve({ lazy: true, cache: true })
	async routeResolve(this: undefined, route: Route) {
		const location = checkGameFilteringRoute(route);
		if (location) {
			return new LocationRedirect(location);
		}

		const filtering = new GameFilteringContainer(route);
		return Api.sendRequest('/web/discover/games?' + filtering.getQueryString(route));
	}

	get routeTitle() {
		return this.pageTitle;
	}

	routeInit() {
		this.process();
		Ads.setAdUnit('gamesdir');
	}

	routed($payload: any) {
		if ($payload && $payload.metaDescription) {
			Meta.description = $payload.metaDescription;
		}

		if (this.listing && $payload) {
			this.listing.processPayload(this.$route, $payload);
			this.process();
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
		this.listing.setAdTargeting(this.$route);

		if (this.section === 'by-date') {
			this.processDateSection();
		} else if (this.section === 'worst') {
			this.processWorstSection();
		} else {
			this.processGeneralSection();
		}
	}

	processDateSection() {
		this.dateRange = null;
		this.date = '';

		if (this.$route.params.endDate) {
			this.dateRange = [
				date(new Date(this.$route.params.date), 'mediumDate'),
				date(new Date(this.$route.params.endDate), 'mediumDate'),
			];
		} else {
			this.date = date(new Date(this.$route.params.date), 'mediumDate');
		}

		if (!this.dateRange) {
			this.pageTitle = this.$gettextInterpolate('Games Published on %{ date }', {
				date: this.date,
			});
		} else {
			this.pageTitle = this.$gettextInterpolate(
				'Games Published Between %{ dateStart } and %{ dateEnd }',
				{
					dateStart: this.dateRange[0],
					dateEnd: this.dateRange[1],
				}
			);
		}
	}

	processGeneralSection() {
		const sectionTranslationKey = 'games.list.section_' + (this.section || 'hot');
		const sectionHuman = this.translations[sectionTranslationKey];
		let categoryHuman = '';
		if (this.category) {
			const categoryTranslationKey = 'discover.categories.' + this.category.replace('-', '_');
			categoryHuman = this.translations[categoryTranslationKey];
		}

		const context = {
			section: sectionHuman,
			category: categoryHuman,
		};

		this.pageTitle = this.$gettextInterpolate(
			'%{ section } Indie %{ category } Games',
			context
		);
		if (this.category === 'rpg') {
			this.pageTitle = this.$gettextInterpolate('%{ section } Indie RPGs', context);
		} else if (this.category === 'other') {
			this.pageTitle = this.$gettextInterpolate(
				'%{ section } Alternative Indie Games',
				context
			);
		}

		if (this.category === 'rpg') {
			this.descriptiveCategory = this.$gettext('role-playing games');
		} else if (this.category === 'other') {
			this.descriptiveCategory = this.$gettext('alt games and other weirdness');
		} else {
			this.descriptiveCategory = this.$gettextInterpolate('%{ category } games', {
				category: categoryHuman.toLowerCase(),
			});
		}
	}

	processWorstSection() {
		this.pageTitle = 'Ṣ̢̖͇͈͙̹̦Y̱͍͉S̺̳̞͠Y̸̱͚̙͕̺̺ͅS͎̘̲͕̹̀ͅT͉͕̺̲ͅE͓̱̥̠̰̱͚M̪̙̪̥̹ͅ ͏̼̲̫̰E͇̺̩̼R͏̗͙Ŕ͖̦͕Ơ̰̱͖̗̯̞R҉̻̯̠͚';
	}
}
