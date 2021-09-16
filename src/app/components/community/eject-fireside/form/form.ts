import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Community } from '../../../../../_common/community/community.model';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
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
export default class FormCommunityEjectFireside extends BaseForm<FormModel> {
	@Prop(propRequired(Community)) community!: Community;

	@Emit('change') emitChange(_form: FormModel) {}

	otherOptions: string[] = [];

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

		const options = getDatalistOptions('community-eject', this.community.id.toString());
		this.otherOptions = options.getList();
	}

	@Watch('formModel', { deep: true })
	onFormModelChange() {
		this.emitChange(this.formModel);
	}
}
