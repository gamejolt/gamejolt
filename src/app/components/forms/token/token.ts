import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./token.html';

import { BaseForm, FormOnSubmit, FormOnSubmitSuccess, FormOnInit } from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { AppFocusWhen } from '../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';

@View
@Component({
	directives: {
		AppFocusWhen,
	},
})
export class FormToken extends BaseForm<any> implements FormOnInit, FormOnSubmit, FormOnSubmitSuccess
{
	@Prop( String ) token: string;

	onInit()
	{
		this.formModel.token = this.token;
	}

	onSubmit()
	{
		return Api.sendRequest( '/web/dash/token/save', this.formModel );
	}

	onSubmitSuccess( response: any )
	{
		this.formModel.token = response.token;
	}
}
