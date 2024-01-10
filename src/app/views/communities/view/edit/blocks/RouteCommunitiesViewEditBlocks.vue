<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import AppPagination from '../../../../../../_common/pagination/AppPagination.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import AppTimeAgo from '../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { UserBlockModel } from '../../../../../../_common/user/block/block.model';
import AppUserCardHover from '../../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatarImg from '../../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import FormCommunityBlock from '../../../../../components/forms/community/ban/FormCommunityBlock.vue';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../../view.store';

export default {
	...defineAppRouteOptions({
		deps: { params: ['id'] },
		resolver({ route }) {
			return Api.sendRequest('/web/dash/communities/blocks/' + route.params.id);
		},
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const blocks = ref<UserBlockModel[]>([]);
const isAdding = ref(false);
const totalCount = ref(0);
const perPage = ref(0);

const page = ref(1);
// Default to showing new blocks first
const sort = ref('blocked-on');
const sortDirection = ref('desc');

const community = toRef(() => routeStore.community);
const hasBlocks = toRef(() => blocks.value.length > 0);

const sortIcon = computed(() => {
	if (sortDirection.value === 'asc') {
		return 'chevron-up';
	} else {
		return 'chevron-down';
	}
});

const sortDirectionLabel = computed(() => {
	if (sortDirection.value === 'asc') {
		return $gettext('Ascending');
	} else {
		return $gettext('Descending');
	}
});

function onBlockSubmit() {
	isAdding.value = false;
	page.value = 1;
	refetch();
}

async function refetch() {
	const url = `/web/dash/communities/blocks/${community.value.id}?page=${page.value}&sort=${sort.value}&sort-direction=${sortDirection.value}`;
	const payload = await Api.sendRequest(url);
	blocks.value = UserBlockModel.populate(payload.blocks);
}

function changeSort(newSort: string) {
	if (sort.value === newSort) {
		sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
	} else {
		sort.value = newSort;
		sortDirection.value = 'asc';
	}

	page.value = 1;
	refetch();
}

async function onClickLift(newBlock: UserBlockModel) {
	const response = await showModalConfirm(
		$gettext(
			'Do you really want to lift the block for the user @%{ username } early? The reason they were blocked: %{ reason }',
			{ username: newBlock.user.username, reason: newBlock.reason }
		),
		$gettext('Lift Block')
	);

	if (response) {
		let success = false;
		try {
			const payload = await Api.sendRequest(
				`/web/dash/communities/blocks/remove/${newBlock.id}`,
				{},
				{
					detach: true,
				}
			);

			success = payload && payload.success;
		} catch (e) {
			console.error(e);
			success = false;
		}

		if (success) {
			refetch();
		} else {
			showErrorGrowl($gettext('Failed to lift block.'));
		}
	}
}

function onPageChanged(newPage: number) {
	page.value = newPage;
	refetch();
}

createAppRoute({
	onResolved({ payload }) {
		blocks.value = UserBlockModel.populate(payload.blocks);
		totalCount.value = payload.totalCount;
		perPage.value = payload.perPage;

		if (blocks.value.length === 0) {
			isAdding.value = true;
		}
	},
});
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<h2 class="section-header">
			{{ $gettext(`Blocked Users`) }}
		</h2>

		<div class="page-help">
			<p>
				{{
					$gettext(`
					Block users from contributing to this community. They will not be able to join
					or post.
					`)
				}}
			</p>
		</div>

		<AppCardList :is-adding="isAdding">
			<AppCardListAdd :label="$gettext('Block User')" @toggle="isAdding = !isAdding">
				<FormCommunityBlock :community="community" @submit="onBlockSubmit" />
			</AppCardListAdd>
		</AppCardList>
		<div class="table-responsive">
			<table v-if="hasBlocks" class="table">
				<thead>
					<tr>
						<th class="-header" @click="changeSort('name')">
							{{ $gettext(`Blocked user`) }}
							<span v-if="sort === 'name'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('blocker')">
							{{ $gettext(`Issued by`) }}
							<span v-if="sort === 'blocker'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('blocked-on')">
							{{ $gettext(`Blocked on`) }}
							<span v-if="sort === 'blocked-on'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('expires-on')">
							{{ $gettext(`Expires`) }}
							<span v-if="sort === 'expires-on'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					<tr v-for="block of blocks" :key="block.user.id" class="-row">
						<td>
							<router-link
								:to="{
									name: 'profile.overview',
									params: { username: block.user.username },
								}"
								class="-user-link"
							>
								<AppUserCardHover :user="block.user">
									<span class="-user-link">
										<AppUserAvatarImg class="-avatar" :user="block.user" />
										<span class="-user-link-name">
											@{{ block.user.username }}
										</span>
									</span>
								</AppUserCardHover>
							</router-link>
						</td>

						<td>
							<router-link
								v-if="block.blocked_by_user"
								:to="{
									name: 'profile.overview',
									params: { username: block.blocked_by_user.username },
								}"
								class="-user-link"
							>
								<AppUserCardHover :user="block.blocked_by_user">
									<span class="-user-link">
										<AppUserAvatarImg
											class="-avatar"
											:user="block.blocked_by_user"
										/>
										<span class="-user-link-name">
											@{{ block.blocked_by_user.username }}
										</span>
									</span>
								</AppUserCardHover>
							</router-link>
							<span v-else> - </span>
						</td>

						<td class="-info">
							<AppTimeAgo :date="block.blocked_on" />
						</td>

						<td class="-info">
							<span v-if="!block.doesExpire">
								{{ $gettext(`Never`) }}
							</span>
							<AppTimeAgo v-else :date="block.expires_on" is-future />
						</td>

						<td>
							<AppJolticon
								v-app-tooltip="$gettext(`Lift Block`)"
								class="-lift"
								icon="remove"
								@click="onClickLift(block)"
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<AppPagination
			:total-items="totalCount"
			:current-page="page"
			:items-per-page="perPage"
			prevent-url-change
			@pagechange="onPageChanged"
		/>
	</AppCommunitiesViewPageContainer>
</template>

<style lang="stylus" scoped>
.table
	margin-top: 20px

.-row > td
	border-bottom: $border-width-base solid var(--theme-bg-offset)

.-header
	*
		vertical-align: middle
		cursor: pointer

.-user-link
	display: inline-flex
	align-items: center
	max-width: 184px

	&-name
		text-overflow()

.-info
	min-width: 100px

.-avatar
	flex: none
	display: inline-block
	width: $line-height-computed
	margin-right: 6px

.-lift
	cursor: pointer
</style>
