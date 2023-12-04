<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Watch } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityCompetitionEntryModel } from '../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatNumber } from '../../../../../_common/filters/number';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { illNoComments } from '../../../../../_common/illustration/illustrations';
import AppPagination from '../../../../../_common/pagination/AppPagination.vue';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { vAppNoAutoscroll } from '../../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import AppCommunityCompetitionEntryGrid from '../../../../components/community/competition/entry/grid/AppCommunityCompetitionEntryGrid.vue';
import {
	CommunityCompetitionEntryModalHashDeregister,
	showCommunityCompetitionEntryModalIdFromHash,
	watchCommunityCompetitionEntryModalForHash,
} from '../../../../components/community/competition/entry/modal/modal.service';
import { getChannelPathFromRoute, useCommunityRouteStore } from '../view.store';

function getSeedSessionStorageKey(route: RouteLocationNormalized) {
	return (
		'community-competition-random-seed-' +
		route.params.path +
		'/' +
		getChannelPathFromRoute(route)
	);
}

function getValidSortQueryParam(route: RouteLocationNormalized) {
	const paramValue = route.query.sort;
	if (
		typeof paramValue === 'string' &&
		['new', 'old', 'name', 'random', 'best'].includes(paramValue)
	) {
		return paramValue;
	}

	return null;
}

function getValidPageQueryParam(route: RouteLocationNormalized) {
	const paramValue = route.query.page;
	if (typeof paramValue === 'string') {
		const pageNum = parseInt(paramValue, 10);
		if (pageNum >= 1) {
			return pageNum;
		}
	} else if (typeof paramValue === 'number') {
		const pageNum = Math.round(paramValue);
		if (pageNum >= 1) {
			return pageNum;
		}
	}

	return null;
}

function getValidIgnoreAwardsQueryParam(route: RouteLocationNormalized) {
	const paramValue = route.query['ignore-awards'];
	if (typeof paramValue === 'string' || typeof paramValue === 'number') {
		const ignoreAwards = paramValue.toString();
		if (['true', '1'].includes(ignoreAwards)) {
			return true;
		} else if (['false', '0'].includes(ignoreAwards)) {
			return false;
		}
	}

	return null;
}

function getValidCategoryName(route: RouteLocationNormalized) {
	const paramValue = route.query['category'];
	if (typeof paramValue === 'string') {
		return paramValue;
	}

	return null;
}

function makeRequest(route: RouteLocationNormalized) {
	const channel = getChannelPathFromRoute(route);

	const query = [];

	const category = getValidCategoryName(route);
	if (category) {
		query.push(['category', category]);
	} else {
		// Sort and ignore awards are only supported in overall view.
		const sort = getValidSortQueryParam(route);
		if (sort !== null) {
			query.push(['sort', sort]);
		}

		const ignoreAwards = getValidIgnoreAwardsQueryParam(route);
		if (ignoreAwards !== null) {
			// Add as "1" or "0".
			query.push(['ignore-awards', ((ignoreAwards as any) * 1).toString()]);
		}
	}

	const page = getValidPageQueryParam(route);
	if (page !== null) {
		query.push(['page', page]);
	}

	const seed = import.meta.env.SSR
		? null
		: sessionStorage.getItem(getSeedSessionStorageKey(route));
	if (seed) {
		query.push(['seed', seed]);
	}

	let url = `/web/communities/competitions/entries/fetch/${route.params.path}/${channel}`;
	if (query.length > 0) {
		for (let i = 0; i < query.length; i++) {
			const param = query[i];
			url += i === 0 ? '?' : '&';
			url += param[0] + '=' + param[1];
		}
	}

	return Api.sendRequest(url);
}

@Options({
	name: 'RouteCommunitiesViewChannelJamEntries',
	components: {
		AppPopper,
		AppCommunityCompetitionEntryGrid,
		AppPagination,
		AppIllustration,
	},
	directives: {
		AppNoAutoscroll: vAppNoAutoscroll,
	},
})
@OptionsForLegacyRoute({
	deps: {
		params: ['path', 'channel'],
		query: ['sort', 'page', 'category', 'ignore-awards'],
	},
	resolver: ({ route }) => makeRequest(route),
})
export default class RouteCommunitiesViewChannelJamEntries extends LegacyRouteComponent {
	@Prop({ type: Array, required: true }) categories!: CommunityCompetitionVotingCategoryModel[];

	routeStore = setup(() => useCommunityRouteStore())!;

	readonly formatNumber = formatNumber;
	readonly illNoComments = illNoComments;

	entries: CommunityCompetitionEntryModel[] = [];
	perPage = 50;
	page = 1;
	sort = 'random';
	category: string | null = null;
	ignoreAwards: boolean | null = null;
	hashWatchDeregister?: CommunityCompetitionEntryModalHashDeregister;

	get competition() {
		return this.routeStore.competition!;
	}

	get numPlaceholders() {
		return Math.min(this.competition.entry_count, 6);
	}

	get canSortBest() {
		return (
			this.competition.has_community_voting &&
			this.competition.is_voting_enabled &&
			this.competition.period === 'post-comp' &&
			this.competition.are_results_calculated
		);
	}

	get sortOptions() {
		const options = [
			{
				text: this.$gettext(`Random`),
				sort: 'random',
			},
			{
				text: this.$gettext(`Newest`),
				sort: 'new',
			},
			{
				text: this.$gettext(`Oldest`),
				sort: 'old',
			},
			{
				text: this.$gettext(`Name`),
				sort: 'name',
			},
		];

		// Allow sorting by best when community voting and jam is done.
		if (this.canSortBest) {
			options.unshift({
				text: this.$gettext(`Rank`),
				sort: 'best',
			});
		}

		return options;
	}

	get selectedSortOption() {
		return this.sortOptions.find(i => i.sort === this.sort)!;
	}

	get pageCount() {
		return Math.ceil(this.competition.entry_count / this.perPage);
	}

	get hasCategories() {
		return this.categories.length > 0;
	}

	get categoryOptions() {
		const options = [
			{
				text: this.$gettext(`All Entries`),
				category: null,
			} as any,
		];

		for (const category of this.categories) {
			options.push({
				text: category.name,
				category: category.name,
			});
		}

		return options;
	}

	get selectedCategory() {
		return this.categories.find(i => i.name === this.category);
	}

	get shouldShowAwardsFirstOption() {
		return this.competition.are_results_calculated && this.competition.has_awards;
	}

	routeCreated() {
		this.entries = [];

		const page = getValidPageQueryParam(this.$route);
		this.page = page || 1;

		const category = getValidCategoryName(this.$route);
		this.category = category;

		if (this.category) {
			this.sort = 'best';
			this.ignoreAwards = null;
		} else {
			const sort = getValidSortQueryParam(this.$route);
			if (sort) {
				this.sort = sort;
			} else {
				if (this.canSortBest) {
					this.sort = 'best';
				} else {
					this.sort = 'random';
				}
			}

			const ignoreAwards = getValidIgnoreAwardsQueryParam(this.$route);
			this.ignoreAwards = ignoreAwards || null;
		}
	}

	routeResolved($payload: any) {
		this.handlePayload($payload);
		showCommunityCompetitionEntryModalIdFromHash(this.$router);
		if (!this.hashWatchDeregister) {
			this.hashWatchDeregister = watchCommunityCompetitionEntryModalForHash(this.$router);
		}
	}

	// Watch the entry count change.
	// It does when the user adds/removes one of their entries.
	// In that case, we want to reset the view to page 1 of newest games.
	// That way, they will see their newly added entry in the list of entries instead of
	// having to refresh.
	@Watch('competition.entry_count')
	onEntryCountChanged() {
		if (!this.isRouteBootstrapped) {
			return;
		}

		if (this.$route.query.sort !== 'new' || this.$route.query.page !== undefined) {
			Scroll.shouldAutoScroll = false;
			this.$router.push({
				query: {
					sort: 'new',
					page: undefined,
				},
			});
		} else {
			// Already viewing that page? Reload page.
			this.reloadPage();
		}
	}

	routeDestroyed() {
		if (this.hashWatchDeregister) {
			this.hashWatchDeregister();
			this.hashWatchDeregister = undefined;
		}
	}

	async reloadPage() {
		const payload = await makeRequest(this.$route);
		this.handlePayload(payload);
	}

	handlePayload($payload: any) {
		this.entries = CommunityCompetitionEntryModel.populate($payload.entries);
		if (this.entries.length > this.competition.entry_count) {
			this.competition.entry_count = this.entries.length;
		}
		this.perPage = $payload.perPage;

		// If we receive a seed from backend, store it so it can be sent with the next request.
		const seed = $payload.seed;
		if (seed && !import.meta.env.SSR) {
			sessionStorage.setItem(getSeedSessionStorageKey(this.$route), seed);
		}
	}
}
</script>

<template>
	<div>
		<template v-if="!competition.entry_count">
			<h2 class="section-header">
				<AppTranslate>Entries</AppTranslate>
			</h2>

			<AppIllustration :asset="illNoComments">
				<p>
					<AppTranslate>No entries have been submitted to this jam yet...</AppTranslate>
				</p>
			</AppIllustration>
		</template>
		<template v-else>
			<h2 class="section-header">
				<AppTranslate
					:translate-n="competition.entry_count"
					:translate-params="{
						count: formatNumber(competition.entry_count),
					}"
					translate-plural="%{ count } Entries"
				>
					%{ count } Entry
				</AppTranslate>
			</h2>

			<div v-if="hasCategories" class="-category-nav-container">
				<router-link
					v-for="categoryOption of categoryOptions"
					:key="categoryOption.text"
					v-app-no-autoscroll
					:to="{
						query: {
							category: categoryOption.category || undefined,
							sort: undefined,
							page: undefined,
						},
					}"
					class="-category-nav-item"
					:class="{
						'-category-nav-item-active': category === categoryOption.category,
					}"
				>
					{{ categoryOption.text }}
					<div
						v-if="category === categoryOption.category"
						class="-category-nav-item-active-bar"
					/>
				</router-link>
			</div>

			<div>
				<span v-if="!category" class="pull-right">
					<AppButton
						v-if="shouldShowAwardsFirstOption"
						sm
						class="-awards-first"
						:icon="ignoreAwards ? 'box-empty' : 'checkbox'"
						:to="{
							query: { page: undefined, sort: sort, 'ignore-awards': +!ignoreAwards },
						}"
					>
						<AppTranslate>Show Awards first</AppTranslate>
					</AppButton>
					<AppTranslate>Sort by</AppTranslate>
					{{ ' ' }}
					<AppPopper>
						<span class="-sort">
							{{ selectedSortOption.text }}
							<AppJolticon icon="chevron-down" />
						</span>

						<template #popover>
							<div class="list-group">
								<router-link
									v-for="sortOption of sortOptions"
									:key="sortOption.sort"
									v-app-no-autoscroll
									:to="{ query: { sort: sortOption.sort, page: undefined } }"
									class="list-group-item has-addon"
								>
									<div class="list-group-item-addon">
										<AppJolticon
											v-if="selectedSortOption.sort === sortOption.sort"
											icon="check"
										/>
									</div>
									{{ sortOption.text }}
								</router-link>
							</div>
						</template>
					</AppPopper>
				</span>

				<AppCommunityCompetitionEntryGrid
					:competition="competition"
					:num-placeholders="numPlaceholders"
					:entries="entries"
					:current-page="page"
					:page-count="pageCount"
					:category="selectedCategory"
				/>

				<AppPagination
					v-if="pageCount > 0"
					:total-items="competition.entry_count"
					:items-per-page="perPage"
					:current-page="page"
				/>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-sort
	color: var(--theme-link)
	cursor: pointer

.-category-nav
	&-container
		display: flex
		margin-bottom: 24px
		flex-wrap: wrap
		rounded-corners-lg()
		overflow: hidden

	&-item
		display: block
		padding-top: 12px
		padding-bottom: 12px
		padding-right: 24px
		padding-left: 24px
		font-size: $font-size-large * 0.85
		change-bg('bg-offset')
		flex: 1
		min-width: 200px
		text-align: center
		flex-shrink: 0
		position: relative
		transition: background-color 0.2s ease

		&-active
			change-bg('bg-subtle')
			font-weight: bold

			&-bar
				position: absolute
				left: 0
				right: 0
				bottom: 0
				height: $border-width-large * 2
				change-bg('bi-bg')

.-awards-first
	margin-bottom: 3px
	margin-right: 16px
</style>
