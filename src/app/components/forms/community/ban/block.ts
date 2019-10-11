import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Growls } from '../../../../../_common/growls/growls.service';

type BlockData = {
	username: string;
	reasonType: string;
	reason: string;
	expiry: string;
	ejectPosts: boolean;
	removeComments: boolean;
};

@Component({
	components: {
		AppFormControlToggle,
	},
})
export default class FormCommunityBlock extends BaseForm<BlockData>
	implements FormOnInit, FormOnSubmit {
	@Prop(Community)
	community!: Community;

	resetOnSubmit = true;

	get defaultReasons() {
		return ['Spam', 'Off Topic', 'Offensive or insulting', 'Other'];
	}

	get expiryOptions() {
		return ['1 Hour', '1 Day', '1 Week', '1 Month', '1 Year', 'Never'];
	}

	get showReasonOther() {
		return this.formModel.reasonType === 'Other';
	}

	onInit() {
		this.setField('reasonType', this.defaultReasons[0]);
		this.setField('expiry', this.expiryOptions[2]); // One week by default.
		this.setField('ejectPosts', true);
		this.setField('removeComments', true);
	}

	async onSubmit() {
		const response = await Api.sendRequest(
			`/web/dash/communities/blocks/add/${this.community.id}`,
			this.formModel
		);

		if (!response.success) {
			if (response.collaborator) {
				Growls.error({
					title: this.$gettext('Moderators cannot be blocked'),
					message: this.$gettextInterpolate(
						'%{ user } is a Moderator on this Community. Remove them from the moderators list first to block them.',
						{ user: this.formModel.username }
					),
				});
			}
		} else {
			Growls.success({
				message: this.$gettextInterpolate('%{ user } was blocked from this Community.', {
					user: this.formModel.username,
				}),
			});
		}

		return response;
	}
}
