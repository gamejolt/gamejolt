import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannel from '../../../forms/community/channel/channel.vue';

@Component({
	components: {
		FormCommunityChannel,
	},
})
export default class AppCommunityChannelRenameModal extends BaseModal {
	@Prop(propRequired(CommunityChannel)) channel!: CommunityChannel;
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(Array)) channels!: CommunityChannel[];

	onSubmit(channel: CommunityChannel) {
		return this.modal.resolve(channel);
	}
}
