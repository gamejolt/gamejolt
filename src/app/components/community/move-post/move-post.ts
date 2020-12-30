import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import AppCommunityChannelSelect from '../../../../_common/community/channel/select/select.vue';
import { FiresidePostCommunity } from '../../../../_common/fireside/post/community/community.model';

@Component({
	components: {
		AppCommunityChannelSelect,
	},
})
export default class AppCommunityMovePost extends Vue {
	@Prop(FiresidePostCommunity)
	firesidePostCommunity!: FiresidePostCommunity;

	@Prop(Array)
	channels!: CommunityChannel[];

	@Emit('select')
	emitSelect(_channel: CommunityChannel) {}

	selectedChannel: CommunityChannel | null = null;

	get selectableChannels() {
		if (!this.firesidePostCommunity.channel) {
			return this.channels;
		}

		return this.channels.filter(i => i.id !== this.firesidePostCommunity.channel!.id);
	}

	get hasSelectedChannel() {
		return this.selectedChannel instanceof CommunityChannel;
	}

	onSelect() {
		if (!this.selectedChannel) {
			return;
		}

		this.emitSelect(this.selectedChannel);
	}
}
