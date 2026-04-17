<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import AppAlertBox from '~common/alert/AppAlertBox.vue';
import { Api } from '~common/api/api.service';
import { formatCurrency } from '~common/filters/currency';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validateMaxValue, validateMinValue } from '~common/form-vue/validators';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = {
	amount: number;
};

type Props = {
	minAmount: number;
	withdrawableAmount: number;
	paypalId?: string;
	paypalEmail?: string;
};
const { minAmount, withdrawableAmount, paypalId, paypalEmail } = defineProps<Props>();

const emit = defineEmits<{
	submit: [model: FormModel];
}>();

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		form.formModel.amount = withdrawableAmount;
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/funds/withdraw', form.formModel);
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});
</script>

<template>
	<template v-if="!paypalId">
		<AppAlertBox icon="notice" color="primary">
			<AppTranslate>
				You must have a PayPal account linked in order to withdraw your funds.
			</AppTranslate>
			{{ ' ' }}
			<RouterLink :to="{ name: 'dash.account.financials' }">
				<AppTranslate>Go to your financials page to set up your PayPal.</AppTranslate>
			</RouterLink>
		</AppAlertBox>
	</template>
	<AppForm v-else :controller="form">
		<p>
			<AppTranslate>
				Please allow 3 days for withdrawals to be processed. At this time all withdrawals
				are handled through PayPal.
			</AppTranslate>
		</p>

		<AppAlertBox icon="notice" color="primary">
			<AppTranslate>
				Make sure the information entered below is correct! You will not get a chance to
				change it after submitting a withdrawal request.
			</AppTranslate>
		</AppAlertBox>

		<AppSpacer vertical :scale="12" />

		<div class="form-group">
			<label class="control-label">
				<AppTranslate>PayPal Account</AppTranslate>
			</label>
			<div class="form-static">{{ paypalEmail }}</div>
			<p class="help-block">
				<AppTranslate>
					You can link a different PayPal account in your payment setup.
				</AppTranslate>
				{{ ' ' }}
				<RouterLink :to="{ name: 'dash.account.financials' }">
					<AppTranslate>Go to your financials page.</AppTranslate>
				</RouterLink>
			</p>
		</div>

		<AppFormGroup name="amount" :label="$gettext(`Amount to Withdraw`)">
			<div class="input-group">
				<span class="input-group-addon">$</span>
				<AppFormControl
					type="currency"
					step="1"
					:validators="[
						validateMinValue(minAmount),
						validateMaxValue(withdrawableAmount),
					]"
				/>
			</div>
			<AppFormControlErrors />

			<p class="help-block">
				<AppTranslate :translate-params="{ amount: formatCurrency(minAmount * 100) }">
					The minimum amount you can withdraw at this time is %{ amount }.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton block show-when-valid>
			<AppTranslate
				:translate-params="{ amount: formatCurrency(form.formModel.amount * 100) }"
			>
				Withdraw %{ amount }
			</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
