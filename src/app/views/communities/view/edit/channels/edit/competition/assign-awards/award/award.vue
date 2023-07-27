<script lang="ts">
import { Emit, Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import draggable from 'vuedraggable';
import { Api } from '../../../../../../../../../../_common/api/api.service';
import { CommunityCompetitionAward } from '../../../../../../../../../../_common/community/competition/award/award.model';
import { CommunityCompetitionEntryAward } from '../../../../../../../../../../_common/community/competition/entry/award/award.model';
import { CommunityCompetitionEntry } from '../../../../../../../../../../_common/community/competition/entry/entry.model';
import { showErrorGrowl } from '../../../../../../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../../../../../../_common/loading/AppLoading.vue';
import AppLoadingFade from '../../../../../../../../../../_common/loading/AppLoadingFade.vue';
import AppPagination from '../../../../../../../../../../_common/pagination/pagination.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../../_common/route/legacy-route-component';
import { vAppTooltip } from '../../../../../../../../../../_common/tooltip/tooltip-directive';
import { CommunityCompetitionEntryModal } from '../../../../../../../../../components/community/competition/entry/modal/modal.service';

type Payload = {
	award: any;
	awardedEntries: any[];
	entries: any[];
	perPage: number;
	entryCount: number;
};

function makeRequest(route: RouteLocationNormalized, page = 1, filterValue = '') {
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

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionAssignAwardsAward',
	components: {
		AppLoading,
		AppLoadingFade,
		draggable,
		AppPagination,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['awardId'] },
	resolver: ({ route }) => makeRequest(route),
})
export default class RouteCommunitiesViewEditChannelsCompetitionAssignAwardsAward extends LegacyRouteComponent {
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

	routeDestroyed() {
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
			showErrorGrowl(this.$gettext(`Could not save entry arrangement.`));
		}
	}

	async onPageChanged(page: number) {
		this.page = page;

		const payload = await makeRequest(this.$route, this.page, this.filterValue);
		this.handlePayload(payload);
	}
}
</script>

<template>
	<div>
		<AppLoadingFade :is-loading="isLoading">
			<div v-if="noAwards" class="alert">
				<p>
					<AppTranslate>No entries have been chosen for this award yet.</AppTranslate>
				</p>
			</div>
			<template v-else>
				<div v-if="awardedEntries.length > 1" class="alert">
					<p>
						<AppTranslate>
							You can sort the entries within this award to decide their order on the
							Games page.
						</AppTranslate>
					</p>
				</div>

				<div class="table-responsive">
					<table class="table">
						<colgroup>
							<col :width="draggableItems.length > 1 ? '80px' : '40px'" />
							<col />
							<col />
						</colgroup>

						<thead>
							<tr>
								<th />
								<th>
									<AppTranslate>Entry</AppTranslate>
								</th>
								<th>
									<AppTranslate>Developer</AppTranslate>
								</th>
							</tr>
						</thead>

						<draggable
							v-model="draggableItems"
							v-bind="{
								handle: '.-drag-handle',
								delay: 100,
								delayOnTouchOnly: true,
							}"
							tag="tbody"
							item-key="id"
						>
							<template #item="{ element }">
								<tr>
									<td>
										<div class="-drag-container">
											<div
												v-if="draggableItems.length > 1"
												class="-drag-handle"
											>
												<AppJolticon icon="arrows-v" />
											</div>
											<AppButton
												v-app-tooltip="
													$gettext(`Remove assigned award from entry`)
												"
												icon="remove"
												sparse
												primary
												@click="onClickUnassign(element)"
											/>
										</div>
									</td>
									<th>
										<a @click="onClickShowEntry(element)">
											{{ element.resource.title }}
										</a>
										<AppJolticon
											v-if="element.is_removed"
											v-app-tooltip.touchable="
												$gettext(`This entry was hidden from the jam`)
											"
											class="text-muted"
											icon="inactive"
										/>
									</th>
									<td>
										{{ element.resource.developer.display_name }}
										<small class="text-muted">
											(@{{ element.resource.developer.username }})
										</small>
									</td>
								</tr>
							</template>
						</draggable>
					</table>
				</div>
			</template>

			<h3><AppTranslate>Choose Entries</AppTranslate></h3>
			<p class="help-block">
				<AppTranslate>Choose an entry or entries to win this award.</AppTranslate>
			</p>

			<input
				:key="$route.params.awardId"
				type="text"
				class="form-control -filter-input"
				:placeholder="$gettext(`Filter entries...`)"
				@input="onFilterInput"
			/>

			<template v-if="unassignedCount === 0">
				<div class="alert">
					<p>
						<span v-if="!!filterValue" v-translate="{ filter: filterValue }">
							No entries matched your filter of <code>"%{ filter }"</code>.
						</span>
						<span v-else>
							<AppTranslate
								>There are no more entries without this award.</AppTranslate
							>
						</span>
					</p>
				</div>
			</template>

			<template v-else-if="entries.length > 0">
				<div class="table-responsive">
					<table class="table">
						<colgroup>
							<col width="40px" />
							<col />
							<col />
						</colgroup>

						<thead>
							<tr>
								<th />
								<th>
									<AppTranslate>Entry</AppTranslate>
								</th>
								<th>
									<AppTranslate>Developer</AppTranslate>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="entry of entries" :key="entry.id">
								<td>
									<AppButton
										v-app-tooltip="$gettext(`Assign award to entry`)"
										icon="add"
										sparse
										primary
										@click="onClickAssign(entry)"
									/>
								</td>
								<th>
									<a @click="onClickShowEntry(entry)">
										{{ entry.resource.title }}
									</a>
									<AppJolticon
										v-if="entry.is_removed"
										v-app-tooltip.touchable="
											$gettext(`This entry was hidden from the jam`)
										"
										class="text-muted"
										icon="inactive"
									/>
								</th>
								<td>
									{{ entry.resource.developer.display_name }}
									<small class="text-muted">
										(@{{ entry.resource.developer.username }})
									</small>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<AppPagination
					:total-items="unassignedCount"
					:current-page="page"
					:items-per-page="perPage"
					prevent-url-change
					@pagechange="onPageChanged"
				/>
			</template>

			<!-- Probably on a too high page -->
			<template v-else>
				<h4>
					<AppTranslate>Whoops! There are no entries back here...</AppTranslate>
				</h4>
				<AppButton icon="reply" @click="onPageChanged(1)">
					<AppTranslate>Go back</AppTranslate>
				</AppButton>
			</template>
		</AppLoadingFade>
	</div>
</template>

<style lang="stylus" scoped>
.-filter-input
	margin-bottom: 16px

.-drag-container
	display: flex
	position: relative
	height: 35px

.-drag-handle
	change-bg('gray')
	position: relative
	display: inline-block
	width: 20px
	cursor: move
	user-select: none
	margin-right: 8px
	rounded-corners()

	> .jolticon
		position: absolute
		top: 50%
		left: 0
		margin-top: -8px
		cursor: inherit
		color: $white
</style>
