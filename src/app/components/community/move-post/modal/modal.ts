import { Component, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppCommunityMovePost from '../move-post.vue';

@Component({
	components: {
		AppCommunityMovePost,
	},
})
export default class AppCommunityMovePostModal extends BaseModal {
	@Prop(FiresidePostCommunity)
	firesidePostCommunity!: FiresidePostCommunity;

	@Prop(Array)
	channels!: CommunityChannel[];

	onChannelSelected(channel: CommunityChannel) {
		this.modal.resolve(channel);
	}
}
