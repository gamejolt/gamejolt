import { Inject, Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import {
	CompetitionPeriodPreComp,
	CompetitionPeriodVoting,
} from '../../../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../../../../_common/community/competition/entry/entry.model';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../../../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../../../../../../../_common/loading/loading.vue';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import AppPagination from '../../../../../../../../../_common/pagination/pagination.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { AppNoAutoscroll } from '../../../../../../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { AppTimeAgo } from '../../../../../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatarImg from '../../../../../../../../../_common/user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../../../../../../../../_common/user/verified-tick/verified-tick.vue';
import AppCommunityCompetitionDate from '../../../../../../../../components/community/competition/date/date.vue';
import { CommunityCompetitionEntryModal } from '../../../../../../../../components/community/competition/entry/modal/modal.service';
import { illNoCommentsSmall } from '../../../../../../../../img/ill/illustrations';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

type Payload = {
	entryCount: number;
	entries: any[];
	perPage: number;
};

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

function getValidSortQueryParam(route: RouteLocationNormalized) {
	const paramValue = route.query.sort;
	if (
		typeof paramValue === 'string' &&
		['name', 'time', 'user', 'visibility'].includes(paramValue)
	) {
		return paramValue;
	}

	return null;
}

function getValidSortDirectionQueryParam(route: RouteLocationNormalized) {
	const paramValue = route.query['sort-direction'];
	if (typeof paramValue === 'string' && ['asc', 'desc'].includes(paramValue)) {
		return paramValue;
	}

	return null;
}

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionEntries',
	components: {
		AppCommunityCompetitionDate,
		AppIllustration,
		AppLoading,
		AppUserCardHover,
		AppUserAvatarImg,
		AppUserVerifiedTick,
		AppTimeAgo,
		AppPagination,
	},
	directives: {
		AppTooltip,
		AppNoAutoscroll,
	},
})
@RouteResolver({
	deps: { params: ['id', 'channel'], query: ['sort', 'sort-direction', 'page'] },
	resolver: ({ route }) => {
		const query = [];

		const sort = getValidSortQueryParam(route);
		if (sort !== null) {
			query.push(['sort', sort]);
		}

		const sortDirection = getValidSortDirectionQueryParam(route);
		if (sortDirection !== null) {
			query.push(['sort-direction', sortDirection]);
		}

		const page = getValidPageQueryParam(route);
		if (page !== null) {
			query.push(['page', page]);
		}

		let url = `/web/dash/communities/competitions/entries/${route.params.id}/${route.params.channel}`;
		for (let i = 0; i < query.length; i++) {
			const param = query[i];
			url += i === 0 ? '?' : '&';
			url += param[0] + '=' + param[1];
		}

		return Api.sendRequest(url);
	},
})
export default class RouteCommunitiesViewEditChannelsCompetitionEntries extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	entryCount = 0;
	entries: CommunityCompetitionEntry[] = [];
	isLoading = true;
	perPage = 50;

	readonly CompetitionPeriodPreComp = CompetitionPeriodPreComp;
	readonly CompetitionPeriodVoting = CompetitionPeriodVoting;
	readonly illNoCommentsSmall = illNoCommentsSmall;

	get competition() {
		return this.routeStore.competition!;
	}

	get sortIcon() {
		if (this.currentSortDirection === 'asc') {
			return 'chevron-up';
		} else {
			return 'chevron-down';
		}
	}

	get sortDirectionLabel() {
		if (this.currentSortDirection === 'asc') {
			return this.$gettext('Ascending');
		} else {
			return this.$gettext('Descending');
		}
	}

	get currentSort() {
		return getValidSortQueryParam(this.$route) || 'time';
	}

	get currentSortDirection() {
		return getValidSortDirectionQueryParam(this.$route) || 'desc';
	}

	get currentPage() {
		return getValidPageQueryParam(this.$route) || 1;
	}

	routeResolved($payload: Payload) {
		this.entryCount = $payload.entryCount;
		this.entries = CommunityCompetitionEntry.populate($payload.entries);
		this.perPage = $payload.perPage;

		this.isLoading = false;
	}

	patchQuery(query: any, paramName: string, paramValue: any) {
		return Object.assign({}, query, {
			[paramName]: paramValue,
		});
	}

	patchLocation(query: any) {
		return {
			name: this.$route.name,
			params: this.$route.params,
			query,
		};
	}

	getFirstPageLocation() {
		const query = this.patchQuery(this.$route.query, 'page', 1);
		return this.patchLocation(query);
	}

	getSortLocation(sort: string) {
		let query = this.$route.query;

		// When clicking on the currently selected sort, flip sort direction.
		if (this.currentSort === sort) {
			const newSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
			query = this.patchQuery(query, 'sort-direction', newSortDirection);
		}
		// Otherwise, reset sort direction to desc and set sort.
		else {
			query = this.patchQuery(query, 'sort', sort);
			query = this.patchQuery(query, 'sort-direction', 'desc');
		}

		// When changing sort, always go back to page 1.
		query = this.patchQuery(query, 'page', 1);

		return this.patchLocation(query);
	}

	onClickShowEntry(entry: CommunityCompetitionEntry) {
		CommunityCompetitionEntryModal.showEntry(entry);
	}

	async onClickRemoveEntry(entry: CommunityCompetitionEntry) {
		if (entry.is_removed) {
			const result = await ModalConfirm.show(
				this.$gettext(`Are you sure you want to readmit this entry to the jam?`)
			);
			if (result) {
				await entry.$unhideEntry();

				showSuccessGrowl(this.$gettext(`Entry was readmitted to the jam.`));
				this.competition.entry_count++;
			}
		} else {
			const result = await ModalConfirm.show(
				this.$gettext(
					`Are you sure you want to hide this entry from the jam? The user will not be able to submit the same entry again, but they can submit other entries.`
				)
			);
			if (result) {
				await entry.$hideEntry();

				showSuccessGrowl(this.$gettext(`Entry was hidden from the jam.`));
				this.competition.entry_count--;
			}
		}
	}
}
