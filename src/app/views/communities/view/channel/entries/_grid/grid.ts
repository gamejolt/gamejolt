import Component from 'vue-class-component';
import { Inject, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router/types/router';
import { propRequired } from '../../../../../../../utils/vue';
import { Api } from '../../../../../../../_common/api/api.service';
import { CommunityCompetitionEntry } from '../../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { number } from '../../../../../../../_common/filters/number';
import AppPagination from '../../../../../../../_common/pagination/pagination.vue';
import AppPopper from '../../../../../../../_common/popper/popper.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import AppCommunityCompetitionEntryGrid from '../../../../../../components/community/competition/entry/grid/grid.vue';
import {
	CommunityCompetitionEntryModal,
	CommunityCompetitionEntryModalHashDeregister,
} from '../../../../../../components/community/competition/entry/modal/modal.service';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	getChannelPathFromRoute,
} from '../../../view.store';

function getSeedSessionStorageKey(route: Route) {
	return (
		'community-competition-random-seed-' +
		route.params.path +
		'/' +
		getChannelPathFromRoute(route)
	);
}

function getValidSortQueryParam(route: Route) {
	const paramValue = route.query.sort;
	if (
		typeof paramValue === 'string' &&
		['new', 'old', 'name', 'random', 'best'].includes(paramValue)
	) {
		return paramValue;
	}

	return null;
}

function getValidPageQueryParam(route: Route) {
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

function getValidIgnoreAwardsQueryParam(route: Route) {
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

function getValidCategoryName(route: Route) {
	const paramValue = route.query['category'];
	if (typeof paramValue === 'string') {
		return paramValue;
	}

	return null;
}

function makeRequest(route: Route) {
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

	const seed = sessionStorage.getItem(getSeedSessionStorageKey(route));
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

@Component({
	name: 'RouteCommunitiesViewChannelEntriesGrid',
	components: {
		AppPopper,
		AppCommunityCompetitionEntryGrid,
		AppPagination,
	},
})
@RouteResolver({
	deps: {
		params: ['path', 'channel'],
		query: ['sort', 'page', 'category', 'ignore-awards'],
	},
	resolver: ({ route }) => makeRequest(route),
})
export default class RouteCommunitiesViewChannelEntriesGrid extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	@Prop(propRequired(Array)) categories!: CommunityCompetitionVotingCategory[];

	readonly number = number;

	entries: CommunityCompetitionEntry[] = [];
	perPage = 50;
	page = 1;
	sort = 'random';
	category: string | null = null;
	ignoreAwards?: boolean = undefined;
	hashWatchDeregister?: CommunityCompetitionEntryModalHashDeregister;

	get competition() {
		return this.routeStore.competition!;
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

	routeCreated() {
		this.entries = [];

		const page = getValidPageQueryParam(this.$route);
		this.page = page || 1;

		const category = getValidCategoryName(this.$route);
		this.category = category;

		if (this.category) {
			this.sort = 'best';
			this.ignoreAwards = undefined;
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
			this.ignoreAwards = ignoreAwards || undefined;
		}
	}

	routeResolved($payload: any) {
		this.handlePayload($payload);

		CommunityCompetitionEntryModal.showFromHash(this.$router);
		if (!this.hashWatchDeregister) {
			this.hashWatchDeregister = CommunityCompetitionEntryModal.watchForHash(this.$router);
		}

		// Watch the entry count change.
		// It does when the user adds/removes one of their entries.
		// In that case, we want to reset the view to page 1 of newest games.
		// That way, they will see their newly added entry in the list of entries instead of
		// having to refresh.
		this.$watch('competition.entry_count', () => {
			if (this.$route.query.sort !== 'new' || this.$route.query.page !== undefined) {
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
		});
	}

	destroyed() {
		if (this.hashWatchDeregister) {
			this.hashWatchDeregister();
			this.hashWatchDeregister = undefined;
		}
	}

	async reloadPage() {
		const request = makeRequest(this.$route);
		const payload = await request;
		this.handlePayload(payload);
	}

	handlePayload($payload: any) {
		this.entries = CommunityCompetitionEntry.populate($payload.entries);
		this.perPage = $payload.perPage;

		// If we receive a seed from backend, store it so it can be sent with the next request.
		const seed = $payload.seed;
		if (seed) {
			sessionStorage.setItem(getSeedSessionStorageKey(this.$route), seed);
		}
	}
}
