import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import AppFormControlToggle from '../../form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { User } from '../../user/user.model';

interface FormModel {
	removeComments: boolean;
}

@Component({
	components: {
		AppFormControlToggle,
	},
})
export default class AppBlockForm extends BaseForm<FormModel> implements FormOnSubmit {
	@Prop(User)
	user!: User;

	onSubmit() {
		const data = {
			username: this.user.username,
			removeComments: !!this.formModel.removeComments,
		};

		return Api.sendRequest('/web/dash/blocks/add', data);
	}
}
