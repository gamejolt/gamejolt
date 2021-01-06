import Component from 'vue-class-component';
import { Emit, Watch } from 'vue-property-decorator';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import {
	getCommunityEjectPostReasons,
	REASON_OTHER,
	REASON_SPAM,
} from '../../../../../_common/user/action-reasons';

export type FormModel = {
	notifyUser: string;
	reasonType: string | null;
	reason: string | null;
};

@Component({})
export default class FormCommunityEjectPost extends BaseForm<FormModel> {
	@Emit('change')
	emitChange(_form: FormModel) {}

	get notifyUserOptions() {
		return {
			no: this.$gettext(`No, do not notify the user.`),
			yes: this.$gettext(`Yes, notify the user.`),
			'yes-reason': this.$gettext(`Yes, notify the user and show them the following reason.`),
		};
	}

	get defaultReasons() {
		return getCommunityEjectPostReasons();
	}

	get shouldShowReasons() {
		return this.formModel.notifyUser === 'yes-reason';
	}

	get showReasonOther() {
		return this.shouldShowReasons && this.formModel.reasonType === REASON_OTHER;
	}

	onInit() {
		this.setField('notifyUser', 'yes');
		this.setField('reasonType', REASON_SPAM);
	}

	@Watch('formModel', { deep: true })
	onFormModelChange() {
		this.emitChange(this.formModel);
	}
}
