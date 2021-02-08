import Component from 'vue-class-component';
import { Emit } from 'vue-property-decorator';
import { Route } from 'vue-router/types/router';
import { Api } from '../../../../../../../../../../_common/api/api.service';
import { CommunityCompetitionAward } from '../../../../../../../../../../_common/community/competition/award/award.model';
import { CommunityCompetitionEntryAward } from '../../../../../../../../../../_common/community/competition/entry/award/award.model';
import { CommunityCompetitionEntry } from '../../../../../../../../../../_common/community/competition/entry/entry.model';
import { Growls } from '../../../../../../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../../../../../../_common/loading/fade/fade.vue';
import AppLoading from '../../../../../../../../../../_common/loading/loading.vue';
import AppPagination from '../../../../../../../../../../_common/pagination/pagination.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../../../../_common/tooltip/tooltip-directive';
import { CommunityCompetitionEntryModal } from '../../../../../../../../../components/community/competition/entry/modal/modal.service';

type Payload = {
	award: any;
	awardedEntries: any[];
	entries: any[];
	perPage: number;
	entryCount: number;
};

function makeRequest(route: Route, page = 1, filterValue = '') {
	let url = `/web/dash/communities/competitions/awards/view/${route.params.awardId}`;
	let query = '';

	if (page !== 1) {
		query += '?page=' + page;
	}
	if (filterValue) {
		query += query === '' ? '?' : '&';
		query += 'q=' + filterValue;
	}

	url += query;

	return Api.sendRequest(url);
}

const draggable = require('vuedraggable');

@Component({
	name: 'RouteCommunitiesViewEditChannelsCompetitionAssignAwardsAward',
	components: {
		AppLoading,
		AppLoadingFade,
		draggable,
		AppPagination,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['awardId'] },
	resolver: ({ route }) => makeRequest(route),
})
export default class RouteCommunitiesViewEditChannelsCompetitionAssignAwardsAward extends BaseRouteComponent {
	award!: CommunityCompetitionAward;
	awardedEntries: CommunityCompetitionEntry[] = [];
	entries: CommunityCompetitionEntry[] = [];
	entryCount!: number;
	perPage = 50;
	isLoading = true;
	filterValue = '';
	page = 1;

	filterDispatcher?: NodeJS.Timer;

	@Emit('assign')
	emitAssign(_awardId: number) {}
	@Emit('unassign')
	emitUnassign(_awardId: number) {}

	get noAwards() {
		return this.awardedEntries.length === 0;
	}

	get unassignedCount() {
		return this.entryCount - this.awardedEntries.length;
	}

	get draggableItems() {
		return this.awardedEntries;
	}

	set draggableItems(sortedEntries: CommunityCompetitionEntry[]) {
		this.saveEntrySort(sortedEntries);
	}

	routeCreated() {
		// When clicking an award in the parent route, this route gets recreated.
		this.isLoading = true;
		this.filterValue = '';
		this.page = 1;

		if (this.filterDispatcher) {
			clearTimeout(this.filterDispatcher);
			this.filterDispatcher = undefined;
		}
	}

	routeResolved($payload: Payload) {
		this.handlePayload($payload);
	}

	destroyed() {
		if (this.filterDispatcher) {
			clearTimeout(this.filterDispatcher);
			this.filterDispatcher = undefined;
		}
	}

	handlePayload($payload: Payload) {
		this.award = new CommunityCompetitionAward($payload.award);
		this.awardedEntries = CommunityCompetitionEntry.populate($payload.awardedEntries);
		this.entries = CommunityCompetitionEntry.populate($payload.entries);
		this.perPage = $payload.perPage;
		this.entryCount = $payload.entryCount;

		this.isLoading = false;
	}

	onClickShowEntry(entry: CommunityCompetitionEntry) {
		CommunityCompetitionEntryModal.showEntry(entry);
	}

	onFilterInput(event: InputEvent) {
		if (this.filterDispatcher) {
			clearTimeout(this.filterDispatcher);
			this.filterDispatcher = undefined;
		}

		const filterValue = (event.target as HTMLInputElement).value;
		if (filterValue !== this.filterValue) {
			this.filterValue = filterValue;
			this.filterDispatcher = setTimeout(() => this.executeFilter(), 500);
		}
	}

	async executeFilter() {
		// Reset page when fetching with a new filter.
		this.page = 1;

		const payload = await makeRequest(this.$route, this.page, this.filterValue);
		this.handlePayload(payload);
	}

	async onClickAssign(entry: CommunityCompetitionEntry) {
		await CommunityCompetitionEntryAward.$assign(entry.id, this.award.id);

		this.emitAssign(this.award.id);

		this.isLoading = true;
		const payload = await makeRequest(this.$route, this.page, this.filterValue);
		this.handlePayload(payload);
	}

	async onClickUnassign(entry: CommunityCompetitionEntry) {
		await CommunityCompetitionEntryAward.$unassign(entry.id, this.award.id);

		this.emitUnassign(this.award.id);

		this.isLoading = true;
		const payload = await makeRequest(this.$route, this.page, this.filterValue);
		this.handlePayload(payload);
	}

	async saveEntrySort(sortedEntries: CommunityCompetitionEntry[]) {
		// Reorder the entries to see the result of the ordering right away.
		this.awardedEntries.splice(0, this.awardedEntries.length, ...sortedEntries);

		const sortedIds = sortedEntries.map(i => i.id);
		try {
			await CommunityCompetitionEntryAward.$saveSort(this.award.id, sortedIds);
		} catch (e) {
			console.error(e);
			Growls.error(this.$gettext(`Could not save entry arrangement.`));
		}
	}

	async onPageChanged(page: number) {
		this.page = page;

		const payload = await makeRequest(this.$route, this.page, this.filterValue);
		this.handlePayload(payload);
	}
}
