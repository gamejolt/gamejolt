import { mixins, Options, Prop } from 'vue-property-decorator';
import { FiresideCommunity } from '../../../../../_common/fireside/community/community.model';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { REASON_OTHER } from '../../../../../_common/user/action-reasons';
import { FormModel } from '../form/form';
import FormCommunityEjectFireside from '../form/form.vue';
import { CommunityEjectFiresideModalResult } from './modal.service';

@Options({
	components: {
		FormCommunityEjectFireside,
	},
})
export default class AppCommunityEjectFiresideModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	firesideCommunity!: FiresideCommunity;

	@Prop({ type: Object, required: true })
	fireside!: Fireside;

	@AppState
	user!: AppStore['user'];

	reasonFormModel: FormModel | null = null;

	get shouldShowForm() {
		// Do not show the form when the logged in user is the owner of the fireside.
		// It does not make sense to let them notify themselves.
		return this.fireside.user.id !== this.user!.id;
	}

	created() {
		// Create a default form model, because the form will not show when the
		// fireside owner opens this modal.
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
		} as CommunityEjectFiresideModalResult;

		// Add custom options entry to list of options.
		if (result.reasonType === REASON_OTHER && result.reason) {
			const options = getDatalistOptions(
				'community-eject',
				this.firesideCommunity.community.id.toString()
			);
			options.unshiftItem(result.reason);
		}

		this.modal.resolve(result);
	}
}
