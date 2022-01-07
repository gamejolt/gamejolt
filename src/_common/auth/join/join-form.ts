import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { BaseForm, FormOnSubmit, FormOnSubmitSuccess } from '../../form-vue/form.service';
import { validateUsername } from '../../form-vue/validators';
import { Provider } from '../../linked-account/linked-account.model';
import { LinkedAccounts } from '../../linked-account/linked-accounts.service';
import AppLoading from '../../loading/loading.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import googleImage from '../google-icon.svg';

export type FormModel = {
	email: string;
	username: string;
	password: string;
	token: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppLoading,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppAuthJoinForm
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess
{
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	blocked?: boolean;

	readonly Connection = Connection;
	readonly Environment = Environment;
	readonly validateUsername = validateUsername;
	readonly googleImage = googleImage;

	created() {
		this.form.warnOnDiscard = false;
	}

	onSubmit() {
		return Api.sendRequest('/web/auth/join', this.formModel);
	}

	onSubmitSuccess(response: any) {
		this.setField('token', response.token);
	}

	/**
	 * Sign up is just login without an account. It'll direct to the correct page when it figures
	 * out if they have an account in the callback URL.
	 */
	linkedChoose(provider: Provider) {
		LinkedAccounts.login(this.$router, provider);
	}
}
