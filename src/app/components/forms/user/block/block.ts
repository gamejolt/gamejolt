import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { Growls } from '../../../../../_common/growls/growls.service';

interface FormModel {
	username: string;
	removeComments: boolean;
}

@Component({
	components: {
		AppFormControlToggle,
	},
})
export default class FormUserBlock extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnSubmitSuccess {
	resetOnSubmit = true;

	onSubmit() {
		return Api.sendRequest(`/web/dash/blocks/add`, this.formModel);
	}

	onSubmitSuccess(response: any) {
		if (response.success) {
			if (this.formModel.removeComments) {
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
	}
}
