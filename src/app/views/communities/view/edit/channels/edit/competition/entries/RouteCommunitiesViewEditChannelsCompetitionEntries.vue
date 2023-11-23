<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouteLocationNormalized, RouteLocationRaw, RouterLink, useRoute } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../_common/button/AppButton.vue';
import {
	CompetitionPeriodPreComp,
	CompetitionPeriodVoting,
} from '../../../../../../../../../_common/community/competition/competition.model';
import {
	$hideCommunityCompetitionEntry,
	$unhideCommunityCompetitionEntry,
	CommunityCompetitionEntryModel,
} from '../../../../../../../../../_common/community/competition/entry/entry.model';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../../../../../_common/illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '../../../../../../../../../_common/illustration/illustrations';
import AppJolticon from '../../../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../../../../../_common/loading/AppLoading.vue';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import AppPagination from '../../../../../../../../../_common/pagination/AppPagination.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { vAppNoAutoscroll } from '../../../../../../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import AppTimeAgo from '../../../../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import AppUserVerifiedTick from '../../../../../../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '../../../../../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatarImg from '../../../../../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import AppCommunityCompetitionDate from '../../../../../../../../components/community/competition/date/AppCommunityCompetitionDate.vue';
import { showEntryFromCommunityCompetitionEntryModal } from '../../../../../../../../components/community/competition/entry/modal/modal.service';
import { useCommunityRouteStore } from '../../../../../view.store';

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

export default {
	...defineAppRouteOptions({
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
	}),
};
</script>

<script lang="ts" setup>
// export default class RouteCommunitiesViewEditChannelsCompetitionEntries extends LegacyRouteComponent {
const routeStore = useCommunityRouteStore()!;
const route = useRoute();

const entries = ref<CommunityCompetitionEntryModel[]>([]);
const entryCount = ref(0);
const isLoading = ref(true);
const perPage = ref(50);

const competition = toRef(() => {
	return routeStore.competition!;
});

const sortIcon = computed(() => {
	if (currentSortDirection.value === 'asc') {
		return 'chevron-up';
	} else {
		return 'chevron-down';
	}
});

const sortDirectionLabel = computed(() => {
	if (currentSortDirection.value === 'asc') {
		return $gettext('Ascending');
	} else {
		return $gettext('Descending');
	}
});

const currentSort = computed(() => {
	return getValidSortQueryParam(route) || 'time';
});

const currentSortDirection = computed(() => {
	return getValidSortDirectionQueryParam(route) || 'desc';
});

const currentPage = computed(() => {
	return getValidPageQueryParam(route) || 1;
});

function patchQuery(query: any, paramName: string, paramValue: any) {
	return Object.assign({}, query, {
		[paramName]: paramValue,
	});
}

function patchLocation(query: any): RouteLocationRaw {
	return {
		name: route.name || undefined,
		params: route.params,
		query,
	};
}

function getFirstPageLocation() {
	const query = patchQuery(route.query, 'page', 1);
	return patchLocation(query);
}

function getSortLocation(sort: string) {
	let query = route.query;

	// When clicking on the currently selected sort, flip sort direction.
	if (currentSort.value === sort) {
		const newSortDirection = currentSortDirection.value === 'asc' ? 'desc' : 'asc';
		query = patchQuery(query, 'sort-direction', newSortDirection);
	}
	// Otherwise, reset sort direction to desc and set sort.
	else {
		query = patchQuery(query, 'sort', sort);
		query = patchQuery(query, 'sort-direction', 'desc');
	}

	// When changing sort, always go back to page 1.
	query = patchQuery(query, 'page', 1);

	return patchLocation(query);
}

function onClickShowEntry(entry: CommunityCompetitionEntryModel) {
	showEntryFromCommunityCompetitionEntryModal(entry);
}

async function onClickRemoveEntry(entry: CommunityCompetitionEntryModel) {
	if (entry.is_removed) {
		const result = await showModalConfirm(
			$gettext(`Are you sure you want to readmit this entry to the jam?`)
		);
		if (result) {
			await $unhideCommunityCompetitionEntry(entry);

			showSuccessGrowl($gettext(`Entry was readmitted to the jam.`));
			competition.value.entry_count++;
		}
	} else {
		const result = await showModalConfirm(
			$gettext(
				`Are you sure you want to hide this entry from the jam? The user will not be able to submit the same entry again, but they can submit other entries.`
			)
		);
		if (result) {
			await $hideCommunityCompetitionEntry(entry);

			showSuccessGrowl($gettext(`Entry was hidden from the jam.`));
			competition.value.entry_count--;
		}
	}
}
createAppRoute({
	routeTitle: computed(() => ``),
	onResolved({ payload }: { payload: Payload }) {
		entryCount.value = payload.entryCount;
		entries.value = CommunityCompetitionEntryModel.populate(payload.entries);
		perPage.value = payload.perPage;

		isLoading.value = false;
	},
});
</script>

<template>
	<div>
		<h2 class="sans-margin-top">
			{{ $gettext(`Manage Jam Entries`) }}
		</h2>

		<template v-if="isLoading">
			<AppLoading centered />
		</template>
		<template v-else-if="competition.periodNum === CompetitionPeriodPreComp">
			<p>
				{{
					$gettext(
						`The jam has not yet begun and has no entries. Check back later when the jam has started.`
					)
				}}
			</p>
			<p class="help-block">
				{{ $gettext(`The Jam starts on:`) }}

				<AppCommunityCompetitionDate
					:date="competition.starts_on"
					:timezone="competition.timezone"
				/>
			</p>
		</template>
		<template v-else>
			<template v-if="entryCount === 0">
				<AppIllustration :asset="illNoCommentsSmall">
					<p>
						<template v-if="competition.periodNum >= CompetitionPeriodVoting">
							{{
								$gettext(
									`No new entries can be submitted to the jam, and none have been submitted during its runtime.`
								)
							}}
						</template>
						<template v-else>
							{{
								$gettext(
									`There are currently no submissions entered into the jam yet. Once they are entered, they will show up here.`
								)
							}}
						</template>
					</p>
				</AppIllustration>
			</template>

			<template v-else>
				<p class="help-block">
					<span v-translate="{ count: entryCount }">
						<b>%{ count }</b> total entries have been submitted.
					</span>
					<br />
					<template v-if="entryCount > competition.entry_count">
						<span
							v-translate="{
								count: entryCount - competition.entry_count,
								visibleCount: competition.entry_count,
							}"
						>
							<b>%{ count }</b> have been hidden, resulting in
							<b>%{ visibleCount }</b> visible entries.
						</span>
					</template>
					<template v-else>
						{{ $gettext(`No entries have been hidden.`) }}
					</template>
				</p>

				<div class="table-responsive">
					<table class="table">
						<thead>
							<tr>
								<th>
									<RouterLink
										v-app-no-autoscroll
										:to="getSortLocation('name')"
										class="link-unstyled -header"
									>
										<span>{{ $gettext(`Title`) }}</span>
										<span v-if="currentSort === 'name'">
											<AppJolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</RouterLink>
								</th>
								<th>
									<RouterLink
										v-app-no-autoscroll
										:to="getSortLocation('user')"
										class="link-unstyled -header"
									>
										<span>{{ $gettext(`Developer`) }}</span>
										<span v-if="currentSort === 'user'">
											<AppJolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</RouterLink>
								</th>
								<th>
									<RouterLink
										v-app-no-autoscroll
										:to="getSortLocation('time')"
										class="link-unstyled -header"
									>
										<span>{{ $gettext(`Entered`) }}</span>
										<span v-if="currentSort === 'time'">
											<AppJolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</RouterLink>
								</th>
								<th>
									<RouterLink
										v-app-no-autoscroll
										:to="getSortLocation('visibility')"
										class="link-unstyled -header"
									>
										<span>{{ $gettext(`Visibility`) }}</span>
										<span v-if="currentSort === 'visibility'">
											<AppJolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</RouterLink>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="entry of entries" :key="entry.id">
								<th>
									<a @click="onClickShowEntry(entry)">
										{{ entry.resource.title }}
									</a>
								</th>
								<td>
									<RouterLink
										:to="{
											name: 'profile.overview',
											params: { username: entry.resource.developer.username },
										}"
										class="-user-link"
									>
										<AppUserCardHover :user="entry.resource.developer">
											<span class="-user-link">
												<AppUserAvatarImg
													class="-avatar"
													:user="entry.resource.developer"
												/>
												<span class="-user-link-name">
													@{{ entry.resource.developer.username }}
												</span>
												&nbsp;
												<AppUserVerifiedTick
													:user="entry.resource.developer"
												/>
											</span>
										</AppUserCardHover>
									</RouterLink>
								</td>
								<td>
									<AppTimeAgo :date="entry.added_on" />
								</td>
								<td>
									<AppButton
										v-app-tooltip="
											entry.is_removed
												? $gettext(`Readmit entry into the Jam`)
												: $gettext(`Hide entry from the Jam`)
										"
										sm
										@click="onClickRemoveEntry(entry)"
									>
										<div v-if="entry.is_removed">
											{{ $gettext(`Readmit Entry`) }}
										</div>
										<div v-else>{{ $gettext(`Hide Entry`) }}</div>
									</AppButton>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<AppPagination
					:total-items="entryCount"
					:current-page="currentPage"
					:items-per-page="perPage"
				/>

				<!-- Probably on a too high page due to editing url. -->
				<template v-if="entryCount > 0 && entries.length === 0">
					<h4>
						{{ $gettext(`Whoops! There are no entries back here...`) }}
					</h4>
					<AppButton :to="getFirstPageLocation()" icon="reply">
						{{ $gettext(`Go back`) }}
					</AppButton>
				</template>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-header
	text-decoration: none

	*
		vertical-align: middle
		cursor: pointer

.-user-link
	display: inline-flex
	align-items: center
	max-width: 184px

	&-name
		text-overflow()

.-avatar
	flex: none
	display: inline-block
	width: $line-height-computed
	height: $line-height-computed
	margin-right: 6px
</style>
