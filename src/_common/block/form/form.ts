import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import AppFormControlToggle from '../../form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { User } from '../../user/user.model';

interface FormModel {
	removeComments: boolean;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class AppBlockForm extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Object)
	user!: User;

	onSubmit() {
		const data = {
			username: this.user.username,
			removeComments: !!this.formModel.removeComments,
		};

		return Api.sendRequest('/web/dash/blocks/add', data);
	}
}
