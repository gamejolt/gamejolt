<script lang="ts">
import { computed, ref } from 'vue';
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
import FormCommunityChannelAdd from '../../../../../../components/forms/community/channel/add/FormCommunityChannelAdd.vue';
import AppCommunitiesViewPageContainer from '../../../_page-container/page-container.vue';
import { loadArchivedChannels, updateCommunity, useCommunityRouteStore } from '../../../view.store';
import AppCommunitiesEditChannelListItem from './_item/AppCommunitiesEditChannelListItem.vue';
import AppCommunitiesEditChannelListPresetItem from './_preset-item/preset-item.vue';

const communityPresetChannels = [
	CommunityPresetChannelType.FEATURED,
	CommunityPresetChannelType.ALL,
];

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;
const { community, archivedChannels, expandedArchivedChannels, loadedArchivedChannels } =
	routeStore;

const activeItem = ref<CommunityChannelModel | CommunityModel | CommunityPresetChannelType>();

const isShowingChannelAdd = ref(false);
const isLoadingArchivedChannels = ref(false);

const hasFullChannelsPermission = computed(() => community.value?.hasPerms('community-channels'));

async function saveChannelSort(sortedChannels: CommunityChannelModel[]) {
	if (!community.value) {
		return;
	}

	// Reorder the channels to see the result of the ordering right away.
	if (community.value.channels) {
		community.value.channels.splice(0, community.value.channels.length, ...sortedChannels);
	}

	const sortedIds = sortedChannels.map(i => i.id);
	try {
		await $saveCommunityChannelSort(community.value.id, sortedIds);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save channel arrangement.`));
	}
}

async function saveChannelSortArchived(sortedChannels: CommunityChannelModel[]) {
	if (!community.value) {
		return;
	}

	// Reorder the channels to see the result of the ordering right away.
	archivedChannels.value.splice(0, archivedChannels.value.length, ...sortedChannels);

	const sortedIds = sortedChannels.map(i => i.id);
	try {
		await $saveCommunityChannelSortArchived(community.value.id, sortedIds);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Could not save channel arrangement.`));
	}
}

function onChannelAdded(channel: CommunityChannelModel) {
	if (community.value && community.value.channels) {
		community.value.channels!.push(channel);
		// Close form after adding a channel.
		isShowingChannelAdd.value = false;
	}
}

function onPresetListItemSaved(newCommunity: CommunityModel) {
	// Since the preset channels are stored on the community, we have to let
	// the routeStore know to update the community with the new information.
	updateCommunity(routeStore, newCommunity);
}

function onActivate(item: typeof activeItem.value) {
	activeItem.value = item;
}

async function onClickArchivedChannels() {
	if (isLoadingArchivedChannels.value) {
		return;
	}

	expandedArchivedChannels.value = !expandedArchivedChannels.value;

	// Load in archived channels.
	if (expandedArchivedChannels.value && !loadedArchivedChannels.value) {
		isLoadingArchivedChannels.value = true;

		await loadArchivedChannels(routeStore);

		loadedArchivedChannels.value = true;
		isLoadingArchivedChannels.value = false;
	}
}
createAppRoute({});
</script>

<template>
	<AppCommunitiesViewPageContainer v-if="community">
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

			<!--TODO(reactive-community-route-store): CommunityPresetChannelType is not a valid type to be passed down to :active-item -->
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
						v-if="community.channels"
						:community="community"
						:channels="community.channels"
						:archived-channels="archivedChannels"
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
						<AppCommunitiesEditChannelListItem
							:community="community"
							:channel="channel"
							:archived-channels="archivedChannels"
						/>
					</template>
				</AppCardListDraggable>
			</AppCardList>

			<template v-if="community.has_archived_channels">
				<h3
					:style="{ marginTop: `24px`, userSelect: `none`, cursor: `pointer` }"
					@click="onClickArchivedChannels"
				>
					<AppJolticon
						:icon="expandedArchivedChannels ? 'chevron-down' : 'chevron-right'"
					/>
					{{ $gettext(`Archived Channels`) }}
				</h3>

				<template v-if="expandedArchivedChannels">
					<template v-if="archivedChannels.length">
						<AppCardList
							:items="archivedChannels"
							:is-draggable="hasFullChannelsPermission"
						>
							<AppCardListDraggable item-key="id" @change="saveChannelSortArchived">
								<template #item="{ element: channel }">
									<AppCommunitiesEditChannelListItem
										:community="community"
										:channel="channel"
										:archived-channels="archivedChannels"
									/>
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
