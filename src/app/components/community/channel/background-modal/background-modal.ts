import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannelBackground from '../../../forms/community/channel/background/background.vue';

@Component({
	components: {
		FormCommunityChannelBackground,
	},
})
export default class AppCommunityChannelBackgroundModal extends BaseModal {
	@Prop(propRequired(CommunityChannel)) channel!: CommunityChannel;

	previousBackgroundId: number | null = null;

	created() {
		if (this.channel.background) {
			this.previousBackgroundId = this.channel.background.id;
		}
	}

	onSubmit(channel: CommunityChannel) {
		const newBackgroundId = (channel.background && channel.background.id) || null;
		if (this.previousBackgroundId === newBackgroundId) {
			this.modal.resolve(this.channel);
		}
		this.previousBackgroundId = newBackgroundId;
	}
}
