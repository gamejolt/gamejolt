import Component from 'vue-class-component';
import { CommunityChannel } from '../../../../../../../_common/community/channel/channel.model';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import { CommunityRemoveChannelModal } from '../../../../../../components/community/remove-channel/modal/modal.service';
import FormCommunityChannel from '../../../../../../components/forms/community/channel/channel.vue';
import { RouteStore, RouteStoreModule } from '../edit.store';

const draggable = require('vuedraggable');

@Component({
	name: 'RouteCommunitiesViewEditChannels',
	components: {
		AppCommunityPerms,
		FormCommunityChannel,
		draggable,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteCommunitiesViewEditChannels extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	get canRemoveChannel() {
		if (!this.community.channels) {
			return false;
		}

		return this.community.channels.length > 1;
	}

	onChannelsChange() {
		this.$emit('channels-change', this.community.channels);
	}

	async saveChannelSort() {
		try {
			await CommunityChannel.$saveSort(
				this.community.id,
				this.community.channels!.map(i => i.id)
			);
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
		await CommunityRemoveChannelModal.show(this.community, channel);

		if (channel._removed) {
			this.community.channels = this.community.channels!.filter(i => i.id !== channel.id);
			this.onChannelsChange();
		}
	}
}
