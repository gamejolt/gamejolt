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

	get canMove() {
		// More than 1, since the post can't be moved to the channel it's already in.
		return this.channels.length > 1;
	}

	onChannelSelected(channel: CommunityChannel) {
		this.modal.resolve(channel);
	}
}
