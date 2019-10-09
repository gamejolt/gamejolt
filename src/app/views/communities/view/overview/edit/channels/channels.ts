import Component from 'vue-class-component';
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
