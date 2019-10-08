import Component from 'vue-class-component';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../../_common/card/list/list.vue';
import { CommunityChannel } from '../../../../../../../_common/community/channel/channel.model';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import FormCommunityChannel from '../../../../../../components/forms/community/channel/channel.vue';
import { RouteStore, RouteStoreModule } from '../edit.store';

const draggable = require('vuedraggable');

@Component({
	name: 'RouteCommunitiesViewEditChannels',
	components: {
		AppCommunityPerms,
		FormCommunityChannel,
		draggable,
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppCardListAdd,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteCommunitiesViewEditChannels extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	activeItem: CommunityChannel | null = null;

	get canRemoveChannel() {
		if (!this.community.channels) {
			return false;
		}

		return this.community.channels.length > 1;
	}

	onChannelsChange() {
		this.$emit('channels-change', this.community.channels);
	}

	async saveChannelSort(sortedChannels: CommunityChannel[]) {
		// Reorder the channels to see the result of the ordering right away.
		this.community.channels!.splice(0, this.community.channels!.length, ...sortedChannels);

		const sortedIds = sortedChannels.map(i => i.id);
		try {
			await CommunityChannel.$saveSort(this.community.id, sortedIds);
			this.onChannelsChange();
		} catch (e) {
			console.error(e);
			Growls.error('Could not save channel arrangement.');
		}
	}

	onChannelAdded(channel: CommunityChannel) {
		this.community.channels!.unshift(channel);
		this.onChannelsChange();
	}

	async onClickRemoveChannel(channel: CommunityChannel) {
		const shouldRemove = await ModalConfirm.show(
			this.$gettext('All posts made on this channel will be ejected from the community'),
			this.$gettextInterpolate('Remove "%{ title }" channel?', { title: channel.title })
		);

		if (!shouldRemove) {
			return;
		}

		try {
			await channel.$remove();
		} catch (e) {
			console.error(e);
			Growls.error('Could not remove channel');
		}

		if (channel._removed) {
			this.community.channels = this.community.channels!.filter(i => i.id !== channel.id);
		}

		this.onChannelsChange();
	}
}
