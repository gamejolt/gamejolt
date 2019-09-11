import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnInit, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { User } from '../../../../_common/user/user.model';
import { currency } from '../../../../_common/filters/currency';
import { Component, Prop } from 'vue-property-decorator';

interface WithdrawFundsFormModel {
	email_address: string;
	amount: number;
}

@Component({})
export default class FormWithdrawFunds extends BaseForm<WithdrawFundsFormModel>
	implements FormOnInit, FormOnSubmit {
	@Prop(User) user!: User;
	@Prop(String) paypalEmail!: string;
	@Prop(Number) minAmount!: number;
	@Prop(Number) withdrawableAmount!: number;

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
