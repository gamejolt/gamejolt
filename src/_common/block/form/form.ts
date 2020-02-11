import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { User } from '../../user/user.model';

@Component({})
export default class AppBlockForm extends BaseForm<any> implements FormOnSubmit {
	@Prop(User)
	user!: User;

	onSubmit() {
		const data = {
			username: this.user.username,
		};

		return Api.sendRequest('/web/dash/blocks/add', data);
	}
}
