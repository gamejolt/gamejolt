import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { formatCurrency } from '../../../../_common/filters/currency';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { User } from '../../../../_common/user/user.model';

interface WithdrawFundsFormModel {
	email_address: string;
	amount: number;
}

class Wrapper extends BaseForm<WithdrawFundsFormModel> {}

@Options({})
export default class FormWithdrawFunds extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Object) user!: User;
	@Prop(String) paypalEmail!: string;
	@Prop(Number) minAmount!: number;
	@Prop(Number) withdrawableAmount!: number;

	readonly formatCurrency = formatCurrency;

	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('email_address', this.paypalEmail);
		this.setField('amount', this.withdrawableAmount);
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/funds/withdraw', this.formModel);
	}
}
