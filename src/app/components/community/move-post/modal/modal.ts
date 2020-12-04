import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import AppCommunityChannelSelect from '../../../../../_common/community/channel/select/select.vue';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { BaseModal } from '../../../../../_common/modal/base';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { FormModel } from '../form/form';
import FormCommunityMovePost from '../form/form.vue';
import { CommunityMovePostModalResult } from './modal.service';

@Component({
	components: {
		AppCommunityChannelSelect,
		FormCommunityMovePost,
	},
})
export default class AppCommunityMovePostModal extends BaseModal {
	@Prop(propRequired(FiresidePostCommunity)) firesidePostCommunity!: FiresidePostCommunity;
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
	@Prop(propRequired(Array)) channels!: CommunityChannel[];

	@AppState
	user!: AppStore['user'];

	selectedChannel: CommunityChannel | null = null;
	reasonFormModel: FormModel | null = null;

	get selectableChannels() {
		if (!this.firesidePostCommunity.channel) {
			return this.channels;
		}

		return this.channels.filter(i => i.id !== this.firesidePostCommunity.channel!.id);
	}

	get hasSelectedChannel() {
		return this.selectedChannel instanceof CommunityChannel;
	}

	get canMove() {
		// More than 1, since the post can't be moved to the channel it's already in.
		return this.channels.length > 1;
	}

	get shouldShowForm() {
		// Do not show the form when the logged in user is the author of the post.
		// It does not really make sense to let them notify themselves.
		return this.post.user.id !== this.user!.id;
	}

	created() {
		// Create a default form model, because the form will not show when a post author moves
		// their own post.
		this.reasonFormModel = {
			notifyUser: 'no',
			reason: null,
			reasonType: null,
		};
	}

	onChangeForm(formModel: FormModel) {
		this.reasonFormModel = formModel;
	}

	onMove() {
		if (this.selectedChannel === null || this.reasonFormModel === null) {
			return;
		}

		const notifyUser = this.reasonFormModel.notifyUser !== 'no';
		const result = {
			channel: this.selectedChannel,
			notifyUser,
			reason: notifyUser ? this.reasonFormModel.reason : null,
			reasonType: notifyUser ? this.reasonFormModel.reasonType : null,
		} as CommunityMovePostModalResult;

		this.modal.resolve(result);
	}
}
