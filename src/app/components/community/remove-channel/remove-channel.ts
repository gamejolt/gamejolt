import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import AppCommunityChannelSelect from '../../../../_common/community/channel/select/select.vue';
import { Community } from '../../../../_common/community/community.model';
import AppExpand from '../../../../_common/expand/expand.vue';
import { Growls, showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppPill from '../../../../_common/pill/pill.vue';

@Options({
	components: {
		AppCommunityChannelSelect,
		AppPill,
		AppExpand,
	},
})
export default class AppCommunityRemoveChannel extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(CommunityChannel)
	channel!: CommunityChannel;

	selectedChannel: CommunityChannel | null = null;
	moving = false;

	@Emit('removed')
	emitRemoved(_postsMovedTo?: CommunityChannel) {}

	get channels() {
		if (!this.community.channels) {
			return [];
		}

		return this.community.channels.filter(i => i.id !== this.channel.id);
	}

	get hasSelectedChannel() {
		return this.selectedChannel instanceof CommunityChannel;
	}

	onMove() {
		if (!this.selectedChannel) {
			return;
		}

		return this.removeChannel(this.selectedChannel);
	}

	onEject() {
		return this.removeChannel();
	}

	private async removeChannel(moveToChannel?: CommunityChannel) {
		let success = false;
		try {
			await this.channel.$remove(moveToChannel);
			success = true;
		} catch (e) {
			showErrorGrowl(
				this.$gettext('Could not remove channel for some reason. Try again later!')
			);
		}

		if (success) {
			this.emitRemoved(moveToChannel);
		}
	}
}
