<script lang="ts">
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
</script>

<template>
	<app-form :controller="form">
		<div class="alert">
			<translate>
				Make sure that the information you enter below is correct. You will not get a chance
				to change it after you submit.
			</translate>
		</div>

		<app-form-group
			v-if="!user.paypal_id"
			name="email_address"
			:label="$gettext(`PayPal Email Address`)"
		>
			<p class="help-block above">
				<translate>
					This must be a valid email address attached to a PayPal account.
				</translate>
			</p>
			<app-form-control type="email" />
			<app-form-control-errors />
		</app-form-group>

		<div v-else class="form-group">
			<label class="control-label"><translate>Current PayPal Account</translate></label>
			<div class="form-static">{{ user.paypal_email_address }}</div>
			<p class="help-block">
				<translate>
					You can link a different PayPal account in your payment setup.
				</translate>
				{{ ' ' }}
				<router-link :to="{ name: 'dash.account.financials' }">
					<translate>Go to your financials page.</translate>
				</router-link>
			</p>
		</div>

		<app-form-group name="amount" :label="$gettext(`Amount to Withdraw`)">
			<p class="help-block above">
				<translate :translate-params="{ amount: formatCurrency(minAmount * 100) }">
					The minimum amount you can withdraw at this time is %{ amount }.
				</translate>
			</p>
			<div class="input-group">
				<span class="input-group-addon">$</span>
				<app-form-control
					type="currency"
					step="1"
					:validators="[
						validateMinValue(minAmount),
						validateMaxValue(withdrawableAmount),
					]"
				/>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate>Send Withdrawal Request</translate>
		</app-form-button>
	</app-form>
</template>
