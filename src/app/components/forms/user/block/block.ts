import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Growls } from '../../../../../_common/growls/growls.service';

type BlockData = {
	username: string;
	removeShouts: boolean;
	removePostComments: boolean;
};

@Component({
	components: {
		AppFormControlToggle,
	},
})
export default class FormUserBlock extends BaseForm<BlockData> implements FormOnSubmit {
	resetOnSubmit = true;

	async onSubmit() {
		const response = await Api.sendRequest(`/web/dash/blocks/add`, this.formModel);
		if (response.success) {
			if (this.formModel.removeShouts || this.formModel.removePostComments) {
				Growls.info({
					message: this.$gettextInterpolate(
						'You blocked %{ user }! It might take a few moments for their comments/shouts to disappear',
						{
							user: this.formModel.username,
						}
					),
				});
			} else {
				Growls.info({
					message: this.$gettextInterpolate('You blocked %{ user }!', {
						user: this.formModel.username,
					}),
				});
			}
		}

		return response;
	}
}
