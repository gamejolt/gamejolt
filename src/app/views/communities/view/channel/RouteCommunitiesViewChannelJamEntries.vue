<script lang="ts">
import { PropType, computed, ref, toRef, toRefs, watch } from 'vue';
import { RouteLocationNormalized, RouterLink, useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { CommunityCompetitionEntryModel } from '../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../_common/community/competition/voting-category/voting-category.model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { illNoComments } from '../../../../../_common/illustration/illustrations';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppPagination from '../../../../../_common/pagination/AppPagination.vue';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { vAppNoAutoscroll } from '../../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { $gettext, $ngettext } from '../../../../../_common/translate/translate.service';
import AppCommunityCompetitionEntryGrid from '../../../../components/community/competition/entry/grid/AppCommunityCompetitionEntryGrid.vue';
import {
	CommunityCompetitionEntryModalHashDeregister,
	showCommunityCompetitionEntryModalIdFromHash,
	watchCommunityCompetitionEntryModalForHash,
} from '../../../../components/community/competition/entry/modal/modal.service';
import { getChannelPathFromRoute, useCommunityRouteStore } from '../view.store';

// TODO(component-setup-refactor-routes-0): RouteCommunitiesViewChannelJam which uses this route component doesn't seem to be used anywhere.
// might need to remove this as well.
export default {
	...defineAppRouteOptions({
		deps: {
			params: ['path', 'channel'],
			query: ['sort', 'page', 'category', 'ignore-awards'],
		},
		resolver: ({ route }) => makeRequest(route),
	}),
	components: { AppIllustration },
};
</script>

<script lang="ts" setup>
const props = defineProps({
	categories: {
		type: Array as PropType<CommunityCompetitionVotingCategoryModel[]>,
		required: true,
	},
});

const routeStore = useCommunityRouteStore()!;
const route = useRoute();
const router = useRouter();
const { categories } = toRefs(props);

const entries = ref<CommunityCompetitionEntryModel[]>([]);
const perPage = ref(50);
const page = ref(1);
const sort = ref('random');
const category = ref<string | null>(null);
const ignoreAwards = ref<boolean | null>(null);
const hashWatchDeregister = ref<CommunityCompetitionEntryModalHashDeregister | undefined>(
	undefined
);

const competition = toRef(() => routeStore.competition!);
const hasCategories = toRef(() => categories.value.length > 0);
const shouldShowAwardsFirstOption = toRef(
	() => competition.value.are_results_calculated && competition.value.has_awards
);

const numPlaceholders = computed(() => Math.min(competition.value.entry_count, 6));

const canSortBest = computed(
	() =>
		competition.value.has_community_voting &&
		competition.value.is_voting_enabled &&
		competition.value.period === 'post-comp' &&
		competition.value.are_results_calculated
);

const sortOptions = computed(() => {
	const options = [
		{
			text: $gettext(`Random`),
			sort: 'random',
		},
		{
			text: $gettext(`Newest`),
			sort: 'new',
		},
		{
			text: $gettext(`Oldest`),
			sort: 'old',
		},
		{
			text: $gettext(`Name`),
			sort: 'name',
		},
	];

	// Allow sorting by best when community voting and jam is done.
	if (canSortBest.value) {
		options.unshift({
			text: $gettext(`Rank`),
			sort: 'best',
		});
	}

	return options;
});

const selectedSortOption = computed(() => sortOptions.value.find(i => i.sort === sort.value)!);

const pageCount = computed(() => Math.ceil(competition.value.entry_count / perPage.value));

const categoryOptions = computed(() => {
	const options = [
		{
			text: $gettext(`All Entries`),
			category: null,
		} as any,
	];

	for (const category of categories.value) {
		options.push({
			text: category.name,
			category: category.name,
		});
	}

	return options;
});

const selectedCategory = computed(() => categories.value.find(i => i.name === category.value));

// Watch the entry count change.
// It does when the user adds/removes one of their entries.
// In that case, we want to reset the view to page 1 of newest games.
// That way, they will see their newly added entry in the list of entries instead of
// having to refresh.
watch(
	() => competition.value.entry_count,
	() => {
		if (route.query.sort !== 'new' || route.query.page !== undefined) {
			Scroll.shouldAutoScroll = false;
			router.push({
				query: {
					sort: 'new',
					page: undefined,
				},
			});
		} else {
			// Already viewing that page? Reload page.
			reloadPage();
		}
	}
);

async function reloadPage() {
	const payload = await makeRequest(route);
	handlePayload(payload);
}

function handlePayload(payload: any) {
	entries.value = CommunityCompetitionEntryModel.populate(payload.entries);
	if (entries.value.length > competition.value.entry_count) {
		competition.value.entry_count = entries.value.length;
	}
	perPage.value = payload.perPage;

	// If we receive a seed from backend, store it so it can be sent with the next request.
	const seed = payload.seed;
	if (seed && !import.meta.env.SSR) {
		sessionStorage.setItem(getSeedSessionStorageKey(route), seed);
	}
}

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

createAppRoute({
	onInit() {
		entries.value = [];

		const validPage = getValidPageQueryParam(route);
		page.value = validPage || 1;

		const validCategory = getValidCategoryName(route);
		category.value = validCategory;

		if (category.value) {
			sort.value = 'best';
			ignoreAwards.value = null;
		} else {
			const validSort = getValidSortQueryParam(route);
			if (validSort) {
				sort.value = validSort;
			} else {
				if (canSortBest.value) {
					sort.value = 'best';
				} else {
					sort.value = 'random';
				}
			}

			const validIgnoreAwards = getValidIgnoreAwardsQueryParam(route);
			ignoreAwards.value = validIgnoreAwards || null;
		}
	},

	onDestroyed() {
		if (hashWatchDeregister.value) {
			hashWatchDeregister.value();
			hashWatchDeregister.value = undefined;
		}
	},
	onResolved({ payload }) {
		handlePayload(payload);
		showCommunityCompetitionEntryModalIdFromHash(router);
		if (!hashWatchDeregister.value) {
			hashWatchDeregister.value = watchCommunityCompetitionEntryModalForHash(router);
		}
	},
});
</script>

<template>
	<div>
		<template v-if="!competition.entry_count">
			<h2 class="section-header">
				{{ $gettext(`Entries`) }}
			</h2>

			<AppIllustration :asset="illNoComments">
				<p>
					{{ $gettext(`No entries have been submitted to this jam yet...`) }}
				</p>
			</AppIllustration>
		</template>
		<template v-else>
			<h2 class="section-header">
				{{
					$ngettext('%{ count } Entry.', '%{ count } Entries', competition.entry_count, {
						count: competition.entry_count,
					})
				}}
			</h2>

			<div v-if="hasCategories" class="-category-nav-container">
				<RouterLink
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
				</RouterLink>
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
						{{ $gettext(`Show Awards first`) }}
					</AppButton>
					{{ $gettext(`Sort by`) }}
					{{ ' ' }}
					<AppPopper>
						<span class="-sort">
							{{ selectedSortOption.text }}
							<AppJolticon icon="chevron-down" />
						</span>

						<template #popover>
							<div class="list-group">
								<RouterLink
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
								</RouterLink>
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
