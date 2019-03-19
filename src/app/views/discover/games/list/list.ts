import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { LocationRedirect } from 'game-jolt-frontend-lib/utils/router';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
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
		if (this.section === 'worst') {
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

		if (this.tag) {
			switch (this.section) {
				case 'featured':
					return this.$gettextInterpolate('Featured %{tag} games', { tag: this.tag });

				case 'best':
					return this.$gettextInterpolate('Best %{tag} games (top-rated)', {
						tag: this.tag,
					});

				case 'new':
					return this.$gettextInterpolate('New %{tag} games', { tag: this.tag });

				default:
					return this.$gettextInterpolate('Browsing %{tag} games', { tag: this.tag });
			}
		}

		switch (this.section) {
			case 'featured':
				return this.$gettext('Featured games');

			case 'best':
				return this.$gettext('Best games (top-rated)');

			case 'new':
				return this.$gettext('New games');

			default:
				return this.$gettext('Browsing games');
		}
	}

	/**
	 * This function doesn't translate, but it's only used for meta tags
	 * currently.
	 */
	get routeMeta() {
		let descriptiveTag = `games`;
		if (this.tag === 'fangame') {
			descriptiveTag = `fangames`;
		} else if (this.tag === 'scifi') {
			descriptiveTag = `sci-fi games`;
		} else if (this.tag === 'rpg') {
			descriptiveTag = `rpgs`;
		} else if (this.tag === 'rpg') {
			descriptiveTag = `altgames`;
		} else if (this.tag === 'fnaf') {
			descriptiveTag = `five nights at freddy's fangames`;
		} else if (this.tag) {
			descriptiveTag = `${this.tag} games`;
		}

		if (!this.section) {
			return `Browse the freshest ${descriptiveTag} on Game Jolt. They're almost too hot!`;
		} else if (this.section === 'new') {
			return `Browse new ${descriptiveTag} on Game Jolt. Good or bad, you decide!`;
		} else if (this.section === 'featured') {
			return `Browse unique and alternative ${descriptiveTag} that we have featured on Game Jolt.`;
		} else if (this.section === 'best') {
			return `Browse the best ${descriptiveTag} on Game Jolt.`;
		} else if (this.section === 'worst') {
			return `The worst ${descriptiveTag} decided by the Game Jolt community.`;
		}

		return null;
	}

	routeCreated() {
		this.process();
	}

	routeResolved($payload: any) {
		if ($payload) {
			Meta.description = this.routeMeta;

			Meta.fb.title = this.routeTitle;
			Meta.fb.description = Meta.description;
			Meta.twitter.title = this.routeTitle;
			Meta.twitter.description = Meta.description;

			if (this.spotlightSocial) {
				Meta.twitter.image = this.spotlightSocial;
				Meta.twitter.card = 'summary';
				Meta.fb.image = this.spotlightSocial;
			}
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
	}
}
