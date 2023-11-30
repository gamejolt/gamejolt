<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouteLocationNormalized, useRoute } from 'vue-router';
import draggable from 'vuedraggable';
import { Api } from '../../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../../_common/button/AppButton.vue';
import { CommunityCompetitionAwardModel } from '../../../../../../../../../../_common/community/competition/award/award.model';
import {
	$assignCommunityCompetitionEntryAward,
	$saveSortCommunityCompetitionEntryAward,
	$unassignCommunityCompetitionEntryAward,
} from '../../../../../../../../../../_common/community/competition/entry/award/award.model';
import { CommunityCompetitionEntryModel } from '../../../../../../../../../../_common/community/competition/entry/entry.model';
import { showErrorGrowl } from '../../../../../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../../../../../../_common/loading/AppLoadingFade.vue';
import AppPagination from '../../../../../../../../../../_common/pagination/AppPagination.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../../_common/route/route-component';
import { vAppTooltip } from '../../../../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../../../../_common/translate/translate.service';
import { showEntryFromCommunityCompetitionEntryModal } from '../../../../../../../../../components/community/competition/entry/modal/modal.service';

export default {
	...defineAppRouteOptions({
		deps: { params: ['awardId'] },
		resolver: ({ route }) => makeRequest(route),
	}),
};

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

	return Api.sendRequest<Payload>(url);
}
</script>

<script lang="ts" setup>
const emit = defineEmits({
	assign: (_awardId: number) => true,
	unassign: (_awardId: number) => true,
});

const route = useRoute();

const award = ref<CommunityCompetitionAwardModel | null>(null);
const awardedEntries = ref<CommunityCompetitionEntryModel[]>([]);
const entries = ref<CommunityCompetitionEntryModel[]>([]);
const entryCount = ref(0);
const perPage = ref(50);
const isLoading = ref(true);
const filterValue = ref('');
const page = ref(1);

let filterDispatcher: NodeJS.Timer | undefined;

const noAwards = toRef(() => awardedEntries.value.length === 0);
const unassignedCount = toRef(() => entryCount.value - awardedEntries.value.length);

const draggableItems = computed({
	get() {
		return awardedEntries.value;
	},
	set(sortedEntries: CommunityCompetitionEntryModel[]) {
		saveEntrySort(sortedEntries);
	},
});

function handlePayload(payload: Payload) {
	award.value = new CommunityCompetitionAwardModel(payload.award);
	awardedEntries.value = CommunityCompetitionEntryModel.populate(payload.awardedEntries);
	entries.value = CommunityCompetitionEntryModel.populate(payload.entries);
	perPage.value = payload.perPage;
	entryCount.value = payload.entryCount;

	isLoading.value = false;
}

function onClickShowEntry(entry: CommunityCompetitionEntryModel) {
	showEntryFromCommunityCompetitionEntryModal(entry);
}

function onFilterInput(event: InputEvent) {
	if (filterDispatcher) {
		clearTimeout(filterDispatcher);
		filterDispatcher = undefined;
	}

	const currFilterValue = (event.target as HTMLInputElement).value;
	if (currFilterValue !== filterValue.value) {
		filterValue.value = currFilterValue;
		filterDispatcher = setTimeout(() => executeFilter(), 500);
	}
}

async function executeFilter() {
	// Reset page when fetching with a new filter.
	page.value = 1;

	const payload = await makeRequest(route, page.value, filterValue.value);
	handlePayload(payload);
}

async function onClickAssign(entry: CommunityCompetitionEntryModel) {
	await $assignCommunityCompetitionEntryAward(entry.id, award.value!.id);

	emit('assign', award.value!.id);

	isLoading.value = true;
	const payload = await makeRequest(route, page.value, filterValue.value);
	handlePayload(payload);
}

async function onClickUnassign(entry: CommunityCompetitionEntryModel) {
	await $unassignCommunityCompetitionEntryAward(entry.id, award.value!.id);

	emit('unassign', award.value!.id);

	isLoading.value = true;
	const payload = await makeRequest(route, page.value, filterValue.value);
	handlePayload(payload);
}

async function saveEntrySort(sortedEntries: CommunityCompetitionEntryModel[]) {
	// Reorder the entries to see the result of the ordering right away.
	awardedEntries.value.splice(0, awardedEntries.value.length, ...sortedEntries);

	const sortedIds = sortedEntries.map(i => i.id);
	try {
		await $saveSortCommunityCompetitionEntryAward(award.value!.id, sortedIds);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save entry arrangement.`));
	}
}

async function onPageChanged(newPage: number) {
	page.value = newPage;

	const payload = await makeRequest(route, page.value, filterValue.value);
	handlePayload(payload);
}

createAppRoute({
	onInit() {
		// When clicking an award in the parent route, this route gets recreated.
		isLoading.value = true;
		filterValue.value = '';
		page.value = 1;

		if (filterDispatcher) {
			clearTimeout(filterDispatcher);
			filterDispatcher = undefined;
		}
	},
	onResolved({ payload }) {
		handlePayload(payload);
	},
	onDestroyed() {
		if (filterDispatcher) {
			clearTimeout(filterDispatcher);
			filterDispatcher = undefined;
		}
	},
});
</script>

<template>
	<div>
		<AppLoadingFade :is-loading="isLoading">
			<div v-if="noAwards" class="alert">
				<p>
					{{ $gettext(`No entries have been chosen for this award yet.`) }}
				</p>
			</div>
			<template v-else>
				<div v-if="awardedEntries.length > 1" class="alert">
					<p>
						{{
							$gettext(
								`You can sort the entries within this award to decide their order on the Games page.`
							)
						}}
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
									{{ $gettext(`Entry`) }}
								</th>
								<th>
									{{ $gettext(`Developer`) }}
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

			<h3>{{ $gettext(`Choose Entries`) }}</h3>
			<p class="help-block">
				{{ $gettext(`Choose an entry or entries to win this award.`) }}
			</p>

			<input
				:key="route.params.awardId"
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
							{{ $gettext(`There are no more entries without this award.`) }}
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
									{{ $gettext(`Entry`) }}
								</th>
								<th>
									{{ $gettext(`Developer`) }}
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
				<h4>{{ $gettext(`Whoops! There are no entries back here...`) }}</h4>
				<AppButton icon="reply" @click="onPageChanged(1)">
					{{ $gettext(`Go back`) }}
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
