import { setup } from 'vue-class-component';
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import AppCommunityChannelSelect from '../../../../../_common/community/channel/select/select.vue';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { BaseModal } from '../../../../../_common/modal/base';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { REASON_OTHER } from '../../../../../_common/user/action-reasons';
import { FormModel } from '../form/form';
import FormCommunityMovePost from '../form/form.vue';
import { CommunityMovePostModalResult } from './modal.service';

@Options({
	components: {
		AppCommunityChannelSelect,
		FormCommunityMovePost,
	},
})
export default class AppCommunityMovePostModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) firesidePostCommunity!: FiresidePostCommunity;
	@Prop({ type: Object, required: true }) post!: FiresidePost;
	@Prop({ type: Array, required: true }) channels!: CommunityChannel[];

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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
		// It does not make sense to let them notify themselves.
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
		const hasReason = notifyUser && this.reasonFormModel.notifyUser === 'yes-reason';

		const result = {
			channel: this.selectedChannel,
			notifyUser,
			reason: hasReason ? this.reasonFormModel.reason : null,
			reasonType: hasReason ? this.reasonFormModel.reasonType : null,
		} as CommunityMovePostModalResult;

		// Add custom options entry to list of options.
		if (result.reasonType === REASON_OTHER && result.reason) {
			const options = getDatalistOptions(
				'community-move-post',
				this.firesidePostCommunity.community.id.toString()
			);
			options.unshiftItem(result.reason);
		}

		this.modal.resolve(result);
	}
}
