import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./reset-password.html';

import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

@View
@Component({})
export class FormResetPassword extends BaseForm<any>
	implements FormOnInit, FormOnSubmit {
	@Prop([Number])
	userId: number;
	@Prop([String])
	token: string;

	Connection = makeObservableService(Connection);

	onInit() {
		this.setField('password', '');
	}

	onSubmit() {
		// Will return a bad request if the user ID or key is invalid. Since we
		// checked it in the route component, let's let it process the payload
		// and show an error page.
		return Api.sendRequest('/web/auth/reset-password/' + this.userId, {
			key: this.token,
			password: this.formModel.password,
		});
	}
}
