<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { formatDate } from '../../../../../_common/filters/date';
import { formatFuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import AppGameAddBanner from '../../../../../_common/game/add-banner/AppGameAddBanner.vue';
import { HistoryCache } from '../../../../../_common/history/cache/cache.service';
import { Meta } from '../../../../../_common/meta/meta-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext, $gettextInterpolate } from '../../../../../_common/translate/translate.service';
import { arrayShuffle } from '../../../../../utils/array';
import { RouteLocationRedirect, getParam } from '../../../../../utils/router';
import { titleCase } from '../../../../../utils/string';
import {
	GameFilteringContainer,
	checkGameFilteringRoute,
} from '../../../../components/game/filtering/container';
import AppGameGrid from '../../../../components/game/grid/grid.vue';
import AppGameListing from '../../../../components/game/listing/AppGameListing.vue';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import AppStoreBanner from '../../../../components/store-banner/AppStoreBanner.vue';
import { StoreBannerModel } from '../../../../components/store-banner/store-banner-model';
import AppTagList from '../../../../components/tag/list/list.vue';
import { TagsInfo } from '../../../../components/tag/tags-info.service';

const listingKey = 'CachedListing';

export default {
	...defineAppRouteOptions({
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
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

const filtering = ref<GameFilteringContainer>();
const listing = ref<GameListingContainer>();
const storeBanner = ref<StoreBannerModel>();

const section = computed(() => getParam(route, 'section')?.toLowerCase());
const tag = computed(() => getParam(route, 'tag')?.toLowerCase());

const spotlightSocial = computed(() =>
	tag.value ? TagsInfo.tags.find(i => i.id === tag.value)?.imageSocial : undefined
);

const date = computed(() =>
	section.value === 'by-date'
		? formatDate(new Date(getParam(route, 'date')!), 'mediumDate')
		: undefined
);

const listTitle = computed(() => {
	if (section.value === 'worst') {
		// Excuse me with this?
		return 'Ṣ̢̖͇͈͙̹̦Y̱͍͉S̺̳̞͠Y̸̱͚̙͕̺̺ͅS͎̘̲͕̹̀ͅT͉͕̺̲ͅE͓̱̥̠̰̱͚M̪̙̪̥̹ͅ ͏̼̲̫̰E͇̺̩̼R͏̗͙Ŕ͖̦͕Ơ̰̱͖̗̯̞R҉̻̯̠͚';
	}

	if (date.value) {
		return $gettextInterpolate(`Games published on %{ date }`, {
			date: date.value,
		});
	}

	const onlyFree = filtering.value && filtering.value.getFilter('price') === 'free';

	const title = $gettextInterpolate(`%{ listOf } %{ free } %{ gamesType }`, {
		listOf: displayListOf.value,
		free: onlyFree ? $gettext(`free`) : '',
		gamesType: displayGamesType.value,
	});

	// Remove duplicate whitespaces (formed when a replacement ends up being an empty string)
	return title.replace(/\s+/g, ' ');
});

const displayListOf = computed(() => {
	switch (section.value) {
		case 'hot':
			return $gettext(`Find great`);
		case 'best':
			return $gettext(`Best`);
		case 'new':
			return $gettext(`Newest`);
		default:
			return $gettext(`Featured`);
	}
});

const displayGamesType = computed(() => {
	if (!tag.value) {
		return $gettext(`games`);
	}

	switch (tag.value) {
		case 'horror':
			return $gettext(`scary horror games`);
		case 'fangame':
			return $gettext(`fan games`);
		case 'fnaf':
			return $gettext(`Five Nights at Freddy's (FNaF) games`);
		case 'fnf':
			return $gettext(`Friday Night Funkin' (FNF) games`);
		case 'scifi':
			return $gettext(`science fiction games`);
		case 'retro':
			return $gettext(`retro and old-school games`);
		case 'pointnclick':
			return $gettext(`point and click games`);
		case 'altgame':
			return $gettext(`alt games`);
		case 'roguelike':
			return $gettext(`roguelike games`);
		default:
			return $gettextInterpolate(`%{ category } games`, {
				category: tag.value,
			});
	}
});

/**
 * This function doesn't translate, but it's only used for meta tags
 * currently.
 */
const listDescription = computed(() => {
	if (!section.value) {
		return $gettextInterpolate(
			`Browse our featured list of %{ gamesType }, curated by Game Jolt.`,
			{
				gamesType: displayGamesType.value,
			}
		);
	} else if (section.value === 'new') {
		return $gettextInterpolate(`Find the newest %{ gamesType } on Game Jolt.`, {
			gamesType: displayGamesType.value,
		});
	} else if (section.value === 'hot') {
		return $gettextInterpolate(`Find the hottest trending %{ gamesType } on Game Jolt.`, {
			gamesType: displayGamesType.value,
		});
	} else if (section.value === 'best') {
		return $gettextInterpolate(
			`Find the best %{ gamesType }, top rated by our community on Game Jolt.`,
			{
				gamesType: displayGamesType.value,
			}
		);
	} else if (section.value === 'worst') {
		return $gettextInterpolate(`The worst %{ gamesType } decided by the Game Jolt community.`, {
			gamesType: displayGamesType.value,
		});
	}

	return '';
});

const routeMeta = computed(() => {
	if (!listing.value) {
		return listDescription.value;
	}

	if (!Array.isArray(listing.value.games) || listing.value.games.length === 0) {
		return listDescription.value;
	}

	const count = formatFuzzynumber(listing.value.gamesCount);
	const gameTitles = arrayShuffle(listing.value.games.slice())
		.slice(0, 5)
		.map(game => game.title)
		.join(', ');

	const descriptionStats = $gettextInterpolate(
		`Discover over %{ count } games like %{ gameTitles }`,
		{
			count,
			gameTitles,
		}
	);

	return `${listDescription.value} ${descriptionStats}`;
});

const routeTitle = computed(() => {
	let title = listTitle.value;
	let onlyBrowser = false;

	if (filtering.value) {
		const browserFilters = filtering.value.getFilter('browser');
		const hasBrowserFilters = Array.isArray(browserFilters) && browserFilters.length > 0;

		const osFilters = filtering.value.getFilter('os');
		const hasOsFilters = Array.isArray(osFilters) && osFilters.length > 0;
		onlyBrowser =
			(hasBrowserFilters && !hasOsFilters) ||
			(hasOsFilters && osFilters.length === 1 && osFilters[0] === 'rom');
	}

	if (onlyBrowser) {
		title += ' - ' + $gettext(`Play online`);
	}

	return titleCase(title);
});

const { isLoading } = createAppRoute({
	routeTitle,
	onInit() {
		if (!filtering.value || !listing.value) {
			filtering.value = new GameFilteringContainer(route);
			filtering.value.isPersistent = true;

			// A stub listing to show before we load.
			listing.value = HistoryCache.get(route, listingKey) ?? new GameListingContainer();
		}

		filtering.value.init(route);
		storeBanner.value = undefined;
	},
	onResolved({ payload }) {
		filtering.value!.init(route);

		const cachedListing = HistoryCache.get(route, listingKey);
		if (cachedListing) {
			listing.value = cachedListing;
		} else {
			listing.value = new GameListingContainer();
			listing.value.processPayload(route, payload);
			HistoryCache.store(route, listing.value, listingKey);
		}

		if (payload) {
			Meta.description = routeMeta.value;

			// We use the listDescription and not Meta.description for fb and twitter because they are shorter and more "embeddable"
			Meta.fb.title = routeTitle.value;
			Meta.fb.description = listDescription.value;
			Meta.twitter.title = routeTitle.value;
			Meta.twitter.description = listDescription.value;

			if (spotlightSocial.value) {
				Meta.twitter.image = spotlightSocial.value;
				Meta.twitter.card = 'summary';
				Meta.fb.image = spotlightSocial.value;
			}

			if (payload.storeBanner) {
				storeBanner.value = new StoreBannerModel(payload.storeBanner);
			}
		}
	},
});

async function loadMore() {
	if (!filtering.value || !listing.value || listing.value.isLoadingMore) {
		return;
	}

	listing.value.isLoadingMore = true;

	const page = listing.value.currentPage + 1;
	const payload = await Api.sendRequest(
		'/web/discover/games?' + filtering.value.getQueryString(route, { page })
	);
	listing.value.processPagePayload(page, payload);
	listing.value.isLoadingMore = false;
}
</script>

<template>
	<div>
		<AppGameAddBanner v-if="Screen.isDesktop" />

		<section v-if="section !== 'by-date'" class="fill-offset">
			<div class="container-xl">
				<h2 class="-browse-heading text-center">
					<AppTranslate>Browse Games</AppTranslate>
				</h2>
			</div>
			<AppTagList />
		</section>

		<div v-if="storeBanner" class="container-xl">
			<br />
			<AppStoreBanner :banner="storeBanner" />
		</div>

		<AppGameListing
			v-if="listing && filtering"
			:listing="listing"
			:filtering="filtering"
			include-featured-section
			:hide-section-nav="section === 'by-date'"
			:is-loading="isLoading"
			@load="loadMore"
		>
			<div v-if="section === 'new'" class="alert alert-info anim-fade-in-enlarge">
				<AppTranslate>
					Newly added games are not moderated, curated, or vetted by the community. You
					can find a goldmine of undiscovered talent or you may see some of the scariest
					shit of your life.
				</AppTranslate>
			</div>

			<AppGameGrid :games="listing.games" show-ads event-label="browse-games" />
		</AppGameListing>
	</div>
</template>

<style lang="stylus" scoped>
.-browse-heading
	margin-top: 24px
</style>
