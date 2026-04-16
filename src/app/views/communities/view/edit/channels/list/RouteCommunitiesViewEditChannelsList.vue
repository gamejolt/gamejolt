<script lang="ts">
import { computed, ref, toRef } from 'vue';

import AppCommunityPerms from '~app/components/community/perms/AppCommunityPerms.vue';
import FormCommunityChannelAdd from '~app/components/forms/community/channel/add/FormCommunityChannelAdd.vue';
import AppCommunityPageContainer from '~app/views/communities/view/_page-container/AppCommunityPageContainer.vue';
import AppCommunitiesEditChannelListItem from '~app/views/communities/view/edit/channels/list/_item/AppCommunitiesEditChannelListItem.vue';
import AppChannelPresetItem from '~app/views/communities/view/edit/channels/list/_preset-item/AppChannelPresetItem.vue';
import { loadArchivedChannels, updateCommunity, useCommunityRouteStore } from '~app/views/communities/view/view.store';
import AppCardList from '~common/card/list/AppCardList.vue';
import AppCardListAdd from '~common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '~common/card/list/AppCardListDraggable.vue';
import {
	$saveCommunityChannelSort,
	$saveCommunityChannelSortArchived,
	CommunityChannelModel,
} from '~common/community/channel/channel.model';
import {
	CommunityModel,
	CommunityPresetChannelType,
} from '~common/community/community.model';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLoading from '~common/loading/AppLoading.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';

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

function onPresetListItemSaved() {
	// Since the preset channels are stored on the community, we have to let
	// the routeStore know to update the community with the new information.
	updateCommunity(routeStore, community.value);
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
	<AppCommunityPageContainer>
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
				:active-item="(activeItem as any)"
				:is-adding="isShowingChannelAdd"
				@activate="onActivate"
			>
				<AppCardListAdd
					:label="$gettext(`Add Channel`)"
					@toggle="isShowingChannelAdd = !isShowingChannelAdd"
				>
					<FormCommunityChannelAdd
						:community="community"
						:channels="community.channels!"
						:archived-channels="routeStore.archivedChannels"
						@submit="onChannelAdded"
					/>
				</AppCardListAdd>

				<AppChannelPresetItem
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
	</AppCommunityPageContainer>
</template>

<style lang="stylus" scoped>
.-archived-heading
	margin-top: 24px
	user-select: none
	cursor: pointer
</style>
