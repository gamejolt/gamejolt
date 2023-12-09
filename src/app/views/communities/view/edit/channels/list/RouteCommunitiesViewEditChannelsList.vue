<script lang="ts">
import { computed, ref, toRef } from 'vue';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/AppCardListDraggable.vue';
import {
	$saveCommunityChannelSort,
	$saveCommunityChannelSortArchived,
	CommunityChannelModel,
} from '../../../../../../../_common/community/channel/channel.model';
import {
	CommunityModel,
	CommunityPresetChannelType,
} from '../../../../../../../_common/community/community.model';
import { showErrorGrowl } from '../../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../../../_common/loading/AppLoading.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import AppCommunityPerms from '../../../../../../components/community/perms/AppCommunityPerms.vue';
import FormCommunityChannelAdd from '../../../../../../components/forms/community/channel/add/add.vue';
import AppCommunitiesViewPageContainer from '../../../_page-container/page-container.vue';
import { loadArchivedChannels, updateCommunity, useCommunityRouteStore } from '../../../view.store';
import AppCommunitiesEditChannelListItem from './_item/AppCommunitiesEditChannelListItem.vue';
import AppCommunitiesEditChannelListPresetItem from './_preset-item/preset-item.vue';

const communityPresetChannels = [
	CommunityPresetChannelType.FEATURED,
	CommunityPresetChannelType.ALL,
];

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const activeItem = ref<
	CommunityChannelModel | CommunityModel | CommunityPresetChannelType | undefined
>(undefined);
const isShowingChannelAdd = ref(false);
const isLoadingArchivedChannels = ref(false);

const community = toRef(() => routeStore.community);
const hasFullChannelsPermission = computed(() => community.value.hasPerms('community-channels'));

async function saveChannelSort(sortedChannels: CommunityChannelModel[]) {
	// Reorder the channels to see the result of the ordering right away.
	community.value.channels!.splice(0, community.value.channels!.length, ...sortedChannels);

	const sortedIds = sortedChannels.map(i => i.id);
	try {
		await $saveCommunityChannelSort(community.value.id, sortedIds);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save channel arrangement.`));
	}
}

async function saveChannelSortArchived(sortedChannels: CommunityChannelModel[]) {
	// Reorder the channels to see the result of the ordering right away.
	routeStore.archivedChannels.splice(0, routeStore.archivedChannels.length, ...sortedChannels);

	const sortedIds = sortedChannels.map(i => i.id);
	try {
		await $saveCommunityChannelSortArchived(community.value.id, sortedIds);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save channel arrangement.`));
	}
}

function onChannelAdded(channel: CommunityChannelModel) {
	community.value.channels!.push(channel);
	// Close form after adding a channel.
	isShowingChannelAdd.value = false;
}

function onPresetListItemSaved(community: CommunityModel) {
	// Since the preset channels are stored on the community, we have to let
	// the routeStore know to update the community with the new information.
	updateCommunity(routeStore, community);
}

function onActivate(item: typeof activeItem.value) {
	activeItem.value = item;
}

async function onClickArchivedChannels() {
	if (isLoadingArchivedChannels.value) {
		return;
	}

	routeStore.expandedArchivedChannels = !routeStore.expandedArchivedChannels;

	// Load in archived channels.
	if (routeStore.expandedArchivedChannels && !routeStore.loadedArchivedChannels) {
		isLoadingArchivedChannels.value = true;

		await loadArchivedChannels(routeStore);

		routeStore.loadedArchivedChannels = true;
		isLoadingArchivedChannels.value = false;
	}
}
createAppRoute({});
</script>

<template>
	<AppCommunitiesViewPageContainer>
		<AppCommunityPerms
			:community="community"
			required="community-channels,community-competitions"
			either
		>
			<h2 class="section-header">
				{{ $gettext(`Channels`) }}
			</h2>

			<div class="page-help">
				<p>
					{{
						$gettext(
							`Channels make it easy for your community members to organize their posts into individual sub-topics.`
						)
					}}
				</p>
			</div>

			<AppCardList
				v-if="hasFullChannelsPermission"
				:items="communityPresetChannels"
				:active-item="activeItem"
				:is-adding="isShowingChannelAdd"
				@activate="onActivate"
			>
				<AppCardListAdd
					:label="$gettext(`Add Channel`)"
					@toggle="isShowingChannelAdd = !isShowingChannelAdd"
				>
					<FormCommunityChannelAdd
						:community="community"
						:channels="community.channels"
						:archived-channels="routeStore.archivedChannels"
						@submit="onChannelAdded"
					/>
				</AppCardListAdd>

				<AppCommunitiesEditChannelListPresetItem
					v-for="presetType of communityPresetChannels"
					:key="presetType"
					:community="community"
					:preset-type="presetType"
					@edit="onPresetListItemSaved"
				/>
			</AppCardList>

			<AppCardList
				v-if="community.channels"
				:items="community.channels"
				:is-draggable="hasFullChannelsPermission"
			>
				<AppCardListDraggable item-key="id" @change="saveChannelSort">
					<template #item="{ element: channel }: { element: CommunityChannelModel }">
						<AppCommunitiesEditChannelListItem :channel="channel" />
					</template>
				</AppCardListDraggable>
			</AppCardList>

			<template v-if="community.has_archived_channels">
				<h3 class="-archived-heading" @click="onClickArchivedChannels">
					<AppJolticon
						:icon="
							routeStore.expandedArchivedChannels ? 'chevron-down' : 'chevron-right'
						"
					/>
					{{ $gettext(`Archived Channels`) }}
				</h3>

				<template v-if="routeStore.expandedArchivedChannels">
					<template v-if="routeStore.archivedChannels.length">
						<AppCardList
							:items="routeStore.archivedChannels"
							:is-draggable="hasFullChannelsPermission"
						>
							<AppCardListDraggable item-key="id" @change="saveChannelSortArchived">
								<template #item="{ element: channel }">
									<AppCommunitiesEditChannelListItem :channel="channel" />
								</template>
							</AppCardListDraggable>
						</AppCardList>
					</template>

					<template v-if="isLoadingArchivedChannels">
						<AppLoading centered />
					</template>
				</template>
			</template>
		</AppCommunityPerms>
	</AppCommunitiesViewPageContainer>
</template>

<style lang="stylus" scoped>
.-archived-heading
	margin-top: 24px
	user-select: none
	cursor: pointer
</style>
