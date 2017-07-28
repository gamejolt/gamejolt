import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGenreList } from '../../../../components/genre/list/list';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { GameFilteringContainer } from '../../../../components/game/filtering/container';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { AppGameListing } from '../../../../components/game/listing/listing';
import { splitHasAnimatedGameThumbnails } from '../../../../components/split-test/split-test-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
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
	@Prop(String) section?: string;

	@Prop(String) category?: string;

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

	hasAnimatedThumbnails = false;

	// TODO(rewrite): Still gotta work on this.
	@RouteResolve({ lazy: true, cache: true })
	async routeResolve(this: undefined, route: VueRouter.Route) {
		const filtering = new GameFilteringContainer();
		filtering.isPersistent = true;

		// If initialization changed the URL, then we don't want to do the API call.
		// This prevents a double API call from going out.
		if (!filtering.init(route, { shouldDetect: true })) {
			return undefined;
		}

		return Api.sendRequest('/web/discover/games?' + filtering.getQueryString(route));
	}

	routeInit() {
		this.process();
	}

	routed() {
		if (this.listing && this.$payload) {
			this.listing.processPayload(this.$route, this.$payload);
			this.process();
		}

		this.hasAnimatedThumbnails = splitHasAnimatedGameThumbnails(this.$route, this.$payload);
	}

	/**
	 * Gets called before the payload and after.
	 */
	process() {
		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer();
			this.filtering.isPersistent = true;
			this.filtering.init(this.$route);

			this.listing = new GameListingContainer(this.filtering);
		}

		if (this.section === 'by-date') {
			this.processDateSection();
		} else if (this.section === 'worst') {
			this.processWorstSection();
		} else {
			this.processGeneralSection();
		}

		Meta.title = this.pageTitle;
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

		this.pageTitle = this.$gettextInterpolate('%{ section } Indie %{ category } Games', context);
		if (this.category === 'rpg') {
			this.pageTitle = this.$gettextInterpolate('%{ section } Indie RPGs', context);
		} else if (this.category === 'other') {
			this.pageTitle = this.$gettextInterpolate('%{ section } Alternative Indie Games', context);
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

		if (this.$payload) {
			Meta.description = this.$payload.metaDescription;
		}
	}

	processWorstSection() {
		this.pageTitle =
			'Ṣ̢̖͇͈͙̹̦Y̱͍͉S̺̳̞͠Y̸̱͚̙͕̺̺ͅS͎̘̲͕̹̀ͅT͉͕̺̲ͅE͓̱̥̠̰̱͚M̪̙̪̥̹ͅ ͏̼̲̫̰E͇̺̩̼R͏̗͙Ŕ͖̦͕Ơ̰̱͖̗̯̞R҉̻̯̠͚';
	}
}
