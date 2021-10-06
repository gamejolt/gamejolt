import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardList from '../../../../../../../_common/card/list/list.vue';
import { CommunityChannel } from '../../../../../../../_common/community/channel/channel.model';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../../../_common/community/community.model';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../../../_common/loading/loading.vue';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import { CommunityRemoveChannelModal } from '../../../../../../components/community/remove-channel/modal/modal.service';
import FormCommunityChannelAdd from '../../../../../../components/forms/community/channel/add/add.vue';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	loadArchivedChannels,
	updateCommunity,
} from '../../../view.store';
import AppCommunitiesViewPageContainer from '../../../_page-container/page-container.vue';
import AppCommunitiesEditChannelListItem from './_item/item.vue';
import AppCommunitiesEditChannelListPresetItem from './_preset-item/preset-item.vue';

@Component({
	name: 'RouteCommunitiesViewEditChannels',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppCardList,
		AppCardListDraggable,
		AppCardListAdd,
		FormCommunityChannelAdd,
		AppCommunitiesEditChannelListPresetItem,
		AppCommunitiesEditChannelListItem,
		AppLoading,
	},
})
export default class RouteCommunitiesViewEditChannelsList extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	activeItem: CommunityChannel | Community | CommunityPresetChannelType | null = null;
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

	async saveChannelSort(sortedChannels: CommunityChannel[]) {
		// Reorder the channels to see the result of the ordering right away.
		this.community.channels!.splice(0, this.community.channels!.length, ...sortedChannels);

		const sortedIds = sortedChannels.map(i => i.id);
		try {
			await CommunityChannel.$saveSort(this.community.id, sortedIds);
		} catch (e) {
			console.error(e);
			Growls.error(this.$gettext(`Could not save channel arrangement.`));
		}
	}

	async saveChannelSortArchived(sortedChannels: CommunityChannel[]) {
		// Reorder the channels to see the result of the ordering right away.
		this.routeStore.archivedChannels.splice(
			0,
			this.routeStore.archivedChannels.length,
			...sortedChannels
		);

		const sortedIds = sortedChannels.map(i => i.id);
		try {
			await CommunityChannel.$saveSortArchived(this.community.id, sortedIds);
		} catch (e) {
			console.error(e);
			Growls.error(this.$gettext(`Could not save channel arrangement.`));
		}
	}

	onChannelAdded(channel: CommunityChannel) {
		this.community.channels!.push(channel);
		// Close form after adding a channel.
		this.isShowingChannelAdd = false;
	}

	onPresetListItemSaved(community: Community) {
		// Since the preset channels are stored on the community, we have to let
		// the routeStore know to update the community with the new information.
		updateCommunity(this.routeStore, community);
	}

	async onClickRemoveChannel(channel: CommunityChannel) {
		await CommunityRemoveChannelModal.show(this.community, channel);

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
