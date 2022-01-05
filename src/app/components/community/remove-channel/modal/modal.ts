import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppCommunityRemoveChannel from '../remove-channel.vue';

@Options({
	components: {
		AppCommunityRemoveChannel,
	},
})
export default class AppCommunityRemoveChannelModal extends mixins(BaseModal) {
	@Prop(Community)
	community!: Community;

	@Prop(CommunityChannel)
	channel!: CommunityChannel;

	onRemoved(postsMovedTo?: CommunityChannel) {
		this.modal.resolve(postsMovedTo || null);
	}
}
