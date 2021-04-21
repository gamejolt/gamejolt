import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlPrefixedInput from '../../../../../_common/form-vue/control/prefixed-input/prefixed-input.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Growls } from '../../../../../_common/growls/growls.service';
import {
	getCommunityBlockReasons,
	REASON_OTHER,
	REASON_SPAM,
} from '../../../../../_common/user/action-reasons';
import { User } from '../../../../../_common/user/user.model';

interface FormModel {
	username: string;
	reasonType: string;
	reason: string;
	expiry: string;
	ejectPosts: boolean;
}

@Component({
	components: {
		AppFormControlToggle,
		AppFormControlPrefixedInput,
	},
})
export default class FormCommunityBlock extends BaseForm<FormModel>
	implements FormOnInit, FormOnSubmit {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propOptional(User, null)) user?: User | null;

	resetOnSubmit = true;
	usernameLocked = false;

	get defaultReasons() {
		return getCommunityBlockReasons();
	}

	get expiryOptions() {
		return {
			hour: this.$gettext('1 Hour'),
			day: this.$gettext('1 Day'),
			week: this.$gettext('1 Week'),
			month: this.$gettext('1 Month'),
			year: this.$gettext('1 Year'),
			never: this.$gettext('Never'),
		};
	}

	get showReasonOther() {
		return this.formModel.reasonType === REASON_OTHER;
	}

	onInit() {
		this.setField('reasonType', REASON_SPAM);
		this.setField('expiry', 'week');
		this.setField('ejectPosts', true);

		if (this.user) {
			this.setField('username', this.user.username);
			this.usernameLocked = true;
		}
	}

	async onSubmit() {
		const response = await Api.sendRequest(
			`/web/dash/communities/blocks/add/${this.community.id}`,
			this.formModel
		);

		if (!response.success) {
			if (response.errors.collaborator) {
				Growls.error({
					title: this.$gettext('Moderators cannot be blocked'),
					message: this.$gettextInterpolate(
						'%{ user } is a Moderator on this Community. Remove them from the moderators list first to block them.',
						{ user: this.formModel.username }
					),
				});
			}
		} else {
			if (this.formModel.ejectPosts) {
				const whatsRemoved = this.$gettext('posts');

				const message = this.$gettextInterpolate(
					'%{ user } was blocked from this Community. It might take a few moments for their %{ stuff } to disappear.',
					{
						user: this.formModel.username,
						stuff: whatsRemoved,
					}
				);

				Growls.success({
					message: this.$gettextInterpolate(message, {
						user: this.formModel.username,
					}),
				});
			} else {
				Growls.success({
					message: this.$gettextInterpolate(
						'%{ user } was blocked from this Community.',
						{
							user: this.formModel.username,
						}
					),
				});
			}
		}

		return response;
	}
}
