import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./withdraw-funds.html';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';

interface WithdrawFundsFormModel {
	email_address: string;
	amount: number;
}

@View
@Component({})
export class FormWithdrawFunds extends BaseForm<WithdrawFundsFormModel>
	implements FormOnInit, FormOnSubmit {
	@Prop(User) user: User;
	@Prop(String) paypalEmail: string;
	@Prop(Number) minAmount: number;
	@Prop(Number) withdrawableAmount: number;

	warnOnDiscard = false;

	readonly currency = currency;

	onInit() {
		this.setField('email_address', this.paypalEmail);
		this.setField('amount', this.withdrawableAmount);
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/funds/withdraw', this.formModel);
	}
}
