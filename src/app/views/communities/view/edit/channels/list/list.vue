<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
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
import AppLoading from '../../../../../../../_common/loading/AppLoading.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { AppCommunityPerms } from '../../../../../../components/community/perms/AppCommunityPerms';
import { showCommunityRemoveChannelModal } from '../../../../../../components/community/remove-channel/modal/modal.service';
import FormCommunityChannelAdd from '../../../../../../components/forms/community/channel/add/add.vue';
import AppCommunitiesViewPageContainer from '../../../_page-container/page-container.vue';
import { loadArchivedChannels, updateCommunity, useCommunityRouteStore } from '../../../view.store';
import AppCommunitiesEditChannelListItem from './_item/item.vue';
import AppCommunitiesEditChannelListPresetItem from './_preset-item/preset-item.vue';

@Options({
	name: 'RouteCommunitiesViewEditChannels',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppCardList,
		AppCardListAdd,
		FormCommunityChannelAdd,
		AppCommunitiesEditChannelListPresetItem,
		AppCommunitiesEditChannelListItem,
		AppCardListDraggable,
		AppLoading,
	},
})
@OptionsForLegacyRoute()
export default class RouteCommunitiesViewEditChannelsList extends LegacyRouteComponent {
	routeStore = setup(() => useCommunityRouteStore())!;

	activeItem: CommunityChannelModel | CommunityModel | CommunityPresetChannelType | null = null;
	isShowingChannelAdd = false;
	isLoadingArchivedChannels = false;

	get community() {
		return this.routeStore.community;
	}

	get communityPresetChannels() {
		return [CommunityPresetChannelType.FEATURED, CommunityPresetChannelType.ALL];
	}

	get hasFullChannelsPermission() {
		return this.community.hasPerms('community-channels');
	}

	async saveChannelSort(sortedChannels: CommunityChannelModel[]) {
		// Reorder the channels to see the result of the ordering right away.
		this.community.channels!.splice(0, this.community.channels!.length, ...sortedChannels);

		const sortedIds = sortedChannels.map(i => i.id);
		try {
			await $saveCommunityChannelSort(this.community.id, sortedIds);
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save channel arrangement.`));
		}
	}

	async saveChannelSortArchived(sortedChannels: CommunityChannelModel[]) {
		// Reorder the channels to see the result of the ordering right away.
		this.routeStore.archivedChannels.splice(
			0,
			this.routeStore.archivedChannels.length,
			...sortedChannels
		);

		const sortedIds = sortedChannels.map(i => i.id);
		try {
			await $saveCommunityChannelSortArchived(this.community.id, sortedIds);
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Could not save channel arrangement.`));
		}
	}

	onChannelAdded(channel: CommunityChannelModel) {
		this.community.channels!.push(channel);
		// Close form after adding a channel.
		this.isShowingChannelAdd = false;
	}

	onPresetListItemSaved(community: CommunityModel) {
		// Since the preset channels are stored on the community, we have to let
		// the routeStore know to update the community with the new information.
		updateCommunity(this.routeStore, community);
	}

	onActivate(item: typeof this.activeItem) {
		this.activeItem = item;
	}

	async onClickRemoveChannel(channel: CommunityChannelModel) {
		await showCommunityRemoveChannelModal(this.community, channel);

		if (channel._removed) {
			this.community.channels = this.community.channels!.filter(i => i.id !== channel.id);
		}
	}

	async onClickArchivedChannels() {
		if (this.isLoadingArchivedChannels) {
			return;
		}

		this.routeStore.expandedArchivedChannels = !this.routeStore.expandedArchivedChannels;

		// Load in archived channels.
		if (this.routeStore.expandedArchivedChannels && !this.routeStore.loadedArchivedChannels) {
			this.isLoadingArchivedChannels = true;

			await loadArchivedChannels(this.routeStore);

			this.routeStore.loadedArchivedChannels = true;
			this.isLoadingArchivedChannels = false;
		}
	}
}
</script>

<template>
	<AppCommunitiesViewPageContainer>
		<AppCommunityPerms
			:community="community"
			required="community-channels,community-competitions"
			either
		>
			<h2 class="section-header">
				<AppTranslate>Channels</AppTranslate>
			</h2>

			<div class="page-help">
				<p>
					<AppTranslate>
						Channels make it easy for your community members to organize their posts
						into individual sub-topics.
					</AppTranslate>
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
					<template #item="{ element: channel }">
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
					<AppTranslate>Archived Channels</AppTranslate>
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
