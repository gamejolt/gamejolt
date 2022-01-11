import { mixins, Options, Prop } from 'vue-property-decorator';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { BaseModal } from '../../../../../_common/modal/base';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { REASON_OTHER } from '../../../../../_common/user/action-reasons';
import { FormModel } from '../form/form';
import FormCommunityEjectPost from '../form/form.vue';
import { CommunityEjectPostModalResult } from './modal.service';

@Options({
	components: {
		FormCommunityEjectPost,
	},
})
export default class AppCommunityEjectPostModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) firesidePostCommunity!: FiresidePostCommunity;
	@Prop({ type: Object, required: true }) post!: FiresidePost;

	@AppState
	user!: AppStore['user'];

	reasonFormModel: FormModel | null = null;

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

	onEject() {
		if (this.reasonFormModel === null) {
			return;
		}

		const notifyUser = this.reasonFormModel.notifyUser !== 'no';
		const hasReason = notifyUser && this.reasonFormModel.notifyUser === 'yes-reason';

		const result = {
			notifyUser,
			reason: hasReason ? this.reasonFormModel.reason : null,
			reasonType: hasReason ? this.reasonFormModel.reasonType : null,
		} as CommunityEjectPostModalResult;

		// Add custom options entry to list of options.
		if (result.reasonType === REASON_OTHER && result.reason) {
			const options = getDatalistOptions(
				'community-eject',
				this.firesidePostCommunity.community.id.toString()
			);
			options.unshiftItem(result.reason);
		}

		this.modal.resolve(result);
	}
}
