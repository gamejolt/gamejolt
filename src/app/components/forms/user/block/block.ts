import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Growls } from '../../../../../_common/growls/growls.service';

type BlockData = {
	username: string;
};

@Component({
	components: {},
})
export default class FormUserBlock extends BaseForm<BlockData> implements FormOnSubmit {
	resetOnSubmit = true;

	async onSubmit() {
		const response = await Api.sendRequest(`/web/dash/blocks/add`, this.formModel);
		if (response.success) {
			Growls.info({
				message: this.$gettextInterpolate('You blocked %{ user }!', {
					user: this.formModel.username,
				}),
			});
		}

		return response;
	}
}
