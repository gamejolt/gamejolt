import Component from 'vue-class-component';
import { Emit } from 'vue-property-decorator';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../../_common/card/list/list.vue';
import { CommunityChannel } from '../../../../../../../_common/community/channel/channel.model';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../../../_common/community/community.model';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip';
import AppCommunityChannelPresetListItem from '../../../../../../components/community/channel/preset-list-item/preset-list-item.vue';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import { CommunityRemoveChannelModal } from '../../../../../../components/community/remove-channel/modal/modal.service';
import FormCommunityChannel from '../../../../../../components/forms/community/channel/channel.vue';
import FormCommunityChannelEdit from '../../../../../../components/forms/community/channel/edit/edit.vue';
import { RouteStore, RouteStoreModule } from '../edit.store';

@Component({
	name: 'RouteCommunitiesViewEditChannels',
	components: {
		AppCommunityPerms,
		FormCommunityChannel,
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppCardListAdd,
		FormCommunityChannelEdit,
		AppCommunityChannelPresetListItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteCommunitiesViewEditChannels extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	activeItem: CommunityChannel | Community | CommunityPresetChannelType | null = null;

	get canRemoveChannel() {
		if (!this.community.channels) {
			return false;
		}

		return this.community.channels.length > 1;
	}

	get communityPresetChannels() {
		return [CommunityPresetChannelType.FEATURED, CommunityPresetChannelType.ALL];
	}

	@Emit('channels-change')
	emitChannelsChange(_channels: CommunityChannel[] | undefined | null) {}

	@Emit('details-change')
	emitDetailsChange(_community: Community) {}

	async saveChannelSort(sortedChannels: CommunityChannel[]) {
		// Reorder the channels to see the result of the ordering right away.
		this.community.channels!.splice(0, this.community.channels!.length, ...sortedChannels);

		const sortedIds = sortedChannels.map(i => i.id);
		try {
			await CommunityChannel.$saveSort(this.community.id, sortedIds);
			this.emitChannelsChange(this.community.channels);
		} catch (e) {
			console.error(e);
			Growls.error('Could not save channel arrangement.');
		}
	}

	onChannelAdded(channel: CommunityChannel) {
		this.community.channels!.push(channel);
		this.emitChannelsChange(this.community.channels);
	}

	async onClickRemoveChannel(channel: CommunityChannel) {
		await CommunityRemoveChannelModal.show(this.community, channel);

		if (channel._removed) {
			this.community.channels = this.community.channels!.filter(i => i.id !== channel.id);
			this.emitChannelsChange(this.community.channels);
		}
	}

	onChannelEdited() {
		this.emitChannelsChange(this.community.channels);
	}

	presetBackgroundEdited() {
		this.emitDetailsChange(this.community);
	}
}
