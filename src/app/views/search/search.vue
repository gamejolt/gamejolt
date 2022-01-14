<script lang="ts">
import { computed, inject, InjectionKey, provide, ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized, useRoute } from 'vue-router';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../_common/ad/ad-store';
import AppExpand from '../../../_common/expand/expand.vue';
import { formatNumber } from '../../../_common/filters/number';
import { Meta } from '../../../_common/meta/meta-service';
import AppPagination from '../../../_common/pagination/pagination.vue';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { Scroll } from '../../../_common/scroll/scroll.service';
import AppPageHeader from '../../components/page-header/page-header.vue';
import { SearchPayload } from '../../components/search/payload-service';
import { Search } from '../../components/search/search-service';
import AppSearch from '../../components/search/search.vue';

const Key: InjectionKey<Controller> = Symbol('search-route');

type Controller = ReturnType<typeof createController>;

export function useSearchRouteController() {
	return inject(Key);
}

function createController({ route }: { route: RouteLocationNormalized }) {
	// We store our own version of the search query and sync back to it on
	// form submission.
	const query = ref(`${route.query.q}`);
	const searchPayload = ref(new SearchPayload('all', {}));

	const hasSearch = computed(() => !!query.value);

	function processPayload({
		payload,
		route,
	}: {
		payload: SearchPayload;
		route: RouteLocationNormalized;
	}) {
		query.value = '';

		if (!route.query.q) {
			searchPayload.value = new SearchPayload('all', {});
			return;
		}

		// Search results should always be deindexed.
		Meta.seo.deindex();

		query.value = route.query.q + '';
		searchPayload.value = payload;

		// We sync the query to the search service so that all places get
		// updated with the new query.
		Search.query = query.value;
	}

	return {
		query,
		searchPayload,
		hasSearch,
		processPayload,
	};
}

@Options({
	name: 'RouteSearch',
	components: {
		AppPageHeader,
		AppExpand,
		AppSearch,
		AppPagination,
	},
})
export default class RouteSearch extends BaseRouteComponent {
	routeStore = setup(() => {
		const c = createController({ route: useRoute() });
		provide(Key, c);
		return c;
	});

	ads = setup(() => useAdsController());

	get hasSearch() {
		return this.routeStore.hasSearch;
	}

	get query() {
		return this.routeStore.query;
	}

	get searchPayload() {
		return this.routeStore.searchPayload;
	}

	readonly Screen = Screen;
	readonly Search = Search;
	readonly Scroll = Scroll;
	readonly formatNumber = formatNumber;

	get routeTitle() {
		if (this.$route.query.q) {
			return this.$gettextInterpolate('Search results for %{ query }', {
				query: this.$route.query.q,
			});
		}
		return this.$gettext('search.page_title');
	}

	get noResults() {
		return (
			this.hasSearch &&
			!this.searchPayload.gamesCount &&
			!this.searchPayload.usersCount &&
			!this.searchPayload.postsCount
		);
	}

	routeCreated() {
		// Always disable ads for now, until we get better controls of when
		// adult content is shown in search.
		const adSettings = new AdSettingsContainer();
		adSettings.isPageDisabled = true;
		setPageAdsSettings(this.ads, adSettings);
	}

	routeDestroyed() {
		releasePageAdsSettings(this.ads);
	}
}
</script>

<template>
	<div>
		<app-page-header should-affix-nav :hide-nav="!hasSearch">
			<template v-if="Screen.isXs">
				<label>
					<translate>Enter your search</translate>
				</label>
				<!--
					If they click into a tag (which goes to search page), we
					don't want to autofocus the input since they're trying to
					see results. Only autofocus search on mobile if they haven't
					searched for anything yet.
				-->
				<app-search autocomplete-disabled :autofocus="!hasSearch" />
			</template>
			<template v-else>
				<template v-if="!hasSearch">
					<p class="text-center text-muted">
						<app-jolticon icon="chevron-up" />
						<translate>search.results_placeholder</translate>
						<app-jolticon icon="chevron-up" />
					</p>
				</template>
				<template v-else>
					<div class="small text-upper text-muted">
						<translate>search.showing_label</translate>
					</div>

					<h2 class="sans-margin-top">
						{{ query }}
					</h2>

					<br />
				</template>
			</template>

			<template v-if="hasSearch" #nav>
				<nav class="platform-list inline">
					<ul>
						<li>
							<router-link
								:to="{ name: 'search.results', query: { q: query } }"
								exact-active-class="active"
							>
								<translate>search.results.overview_tab</translate>
							</router-link>
						</li>
						<li v-if="searchPayload.communitiesCount">
							<router-link
								:to="{ name: 'search.communities', query: { q: query } }"
								exact-active-class="active"
							>
								<translate>Communities</translate>
								<span class="badge">{{
									formatNumber(searchPayload.communitiesCount)
								}}</span>
							</router-link>
						</li>
						<li v-if="searchPayload.usersCount">
							<router-link
								:to="{ name: 'search.users', query: { q: query } }"
								exact-active-class="active"
							>
								<translate>search.results.users_tab</translate>
								<span class="badge">{{
									formatNumber(searchPayload.usersCount)
								}}</span>
							</router-link>
						</li>
						<li v-if="searchPayload.gamesCount">
							<router-link
								:to="{ name: 'search.games', query: { q: query } }"
								exact-active-class="active"
							>
								<translate>search.results.games_tab</translate>
								<span class="badge">{{
									formatNumber(searchPayload.gamesCount)
								}}</span>
							</router-link>
						</li>
					</ul>
				</nav>
			</template>
		</app-page-header>

		<app-expand :when="noResults">
			<section class="section fill-offset">
				<div class="container">
					<translate>search.results.no_results</translate>
				</div>
			</section>
		</app-expand>

		<div id="search-results" class="fill-backdrop">
			<router-view />

			<br />

			<app-pagination
				v-if="searchPayload.perPage && searchPayload.count"
				class="text-center"
				:items-per-page="searchPayload.perPage"
				:total-items="searchPayload.count"
				:current-page="searchPayload.page"
				@pagechange="Scroll.to('search-results', { animate: false })"
			/>
		</div>
	</div>
</template>
