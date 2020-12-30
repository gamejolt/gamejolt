import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import AppCardListAdd from '../../../../../../_common/card/list/add/add.vue';
import AppCardListDraggable from '../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardListItem from '../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../_common/card/list/list.vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../../_common/community/community.model';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import AppCommunityChannelPresetListItem from '../../../../../components/community/channel/preset-list-item/preset-list-item.vue';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { CommunityRemoveChannelModal } from '../../../../../components/community/remove-channel/modal/modal.service';
import FormCommunityChannelAdd from '../../../../../components/forms/community/channel/add/add.vue';
import FormCommunityChannelEdit from '../../../../../components/forms/community/channel/edit/edit.vue';
import { CommunityRouteStore, CommunityRouteStoreKey, updateCommunity } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewEditChannels',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppCardListAdd,
		FormCommunityChannelEdit,
		AppCommunityChannelPresetListItem,
		FormCommunityChannelAdd,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteCommunitiesViewEditChannels extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	activeItem: CommunityChannel | Community | CommunityPresetChannelType | null = null;
	isShowingChannelAdd = false;

	get community() {
		return this.routeStore.community;
	}

	get canRemoveChannel() {
		if (!this.community.channels) {
			return false;
		}

		return this.community.channels.length > 1;
	}

	get communityPresetChannels() {
		return [CommunityPresetChannelType.FEATURED, CommunityPresetChannelType.ALL];
	}

	async saveChannelSort(sortedChannels: CommunityChannel[]) {
		// Reorder the channels to see the result of the ordering right away.
		this.community.channels!.splice(0, this.community.channels!.length, ...sortedChannels);

		const sortedIds = sortedChannels.map(i => i.id);
		try {
			await CommunityChannel.$saveSort(this.community.id, sortedIds);
		} catch (e) {
			console.error(e);
			Growls.error('Could not save channel arrangement.');
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
}
