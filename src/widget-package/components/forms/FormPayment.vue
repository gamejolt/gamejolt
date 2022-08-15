<script lang="ts" s setup>
import { computed, ref } from 'vue';
import { setup } from 'vue-class-component';
import AppButton from '../../../_common/button/AppButton.vue';
import { formatCurrency } from '../../../_common/filters/currency';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlPrefix from '../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import { validateMinValue } from '../../../_common/form-vue/validators';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';
import { PaymentData, useWidgetPackageStore } from '../../store/index';
import AppWidgetModal from '../AppWidgetModal.vue';
import FormAddress from './FormAddress.vue';

interface FormModel {
	email: string;
	amount: string;
}

const { payment, checkout, ...store } = useWidgetPackageStore();
const { user } = setup(() => useCommonStore());

const isShowingAddress = ref(false);
const paymentMethod = ref<PaymentData['method']>('cc-stripe');

const sellable = computed(() => store.sellable.value!);
const pricing = computed(() => store.pricing.value!);
const price = computed(() => store.price.value!);
const minOrderAmount = computed(() => store.minOrderAmount.value!);

const minAmount = computed(() =>
	sellable.value.type === 'paid' ? pricing.value.amount / 100 : minOrderAmount.value / 100
);

const formError = computed(() => {
	for (const { error, name } of form._groups) {
		if (error.value) {
			if (name.value === 'email') {
				return `Please enter a valid email address.`;
			}
			if (name.value === 'amount') {
				switch (error.value.type) {
					case 'required':
						return `Please enter an amount.`;
					case 'min_value':
						return `The amount you entered is too low.`;
					default:
						return `${error.value.type} Please enter a correct amount.`;
				}
			}
		}
	}
	return undefined;
});

const form: FormController<FormModel> = createForm({
	onInit: () => {
		form.formModel.amount = (price.value! / 100).toFixed(2);
	},
	onSubmit: async () => {
		const paymentData = new PaymentData();
		paymentData.method = paymentMethod.value;
		paymentData.amount = parseFloat(form.formModel.amount);
		paymentData.email = form.formModel.email;

		payment.value = paymentData;

		if (paymentMethod.value === 'cc-stripe') {
			checkout();
		} else if (paymentMethod.value === 'paypal') {
			isShowingAddress.value = true;
		}
	},
});

function submit(method: PaymentData['method']) {
	paymentMethod.value = method;
	form.submit();
}
</script>

<template>
	<AppForm :controller="form" class="payment-form">
		<AppFormGroup v-if="!user" class="-group" name="email" label="Send key to">
			<AppFormControl type="email" placeholder="Enter your email address..." />
		</AppFormGroup>
		<div v-else class="form-group -group">
			<label class="control-label"> Logged in as </label>

			<div class="form-control">
				<AppUserAvatarImg :user="user" />
				<div class="user-display-name">
					<a
						class="link-unstyled"
						:href="'https://gamejolt.com' + user.url"
						target="_blank"
					>
						{{ user.display_name }}
					</a>
				</div>
			</div>
		</div>

		<AppFormGroup class="-group -group-amount" name="amount" label="Name your price">
			<AppFormControlPrefix prefix="$">
				<AppFormControl
					type="currency"
					step="1"
					:validators="[validateMinValue(minAmount)]"
				/>
			</AppFormControlPrefix>

			<span v-if="sellable.type === 'paid'" class="text-muted">
				({{ formatCurrency(price) }} or more)

				<span
					v-app-tooltip.touchable="
						`The developer has set the price of this game to ${formatCurrency(
							price
						)}, but you are able to support them by giving more.`
					"
				>
					<AppJolticon icon="help-circle" />
				</span>
			</span>
		</AppFormGroup>

		<div v-if="formError" class="form-errors">
			<div class="alert alert-notice">
				<AppJolticon icon="notice" middle />
				{{ formError }}
			</div>
		</div>
		<div v-else class="payment-methods">
			<AppButton
				icon="credit-card"
				:disabled="form.invalid"
				@click.prevent="submit('cc-stripe')"
			>
				Credit Card
			</AppButton>

			<AppButton :disabled="form.invalid" @click.prevent="submit('paypal')">
				PayPal
			</AppButton>
		</div>
	</AppForm>

	<transition>
		<AppWidgetModal v-if="isShowingAddress" @close="isShowingAddress = false">
			<FormAddress />
		</AppWidgetModal>
	</transition>
</template>

<style lang="stylus" scoped>
.payment-form
	margin-bottom: $shell-padding

	::v-deep(.user-avatar-img)
		width: $input-height-base
		float: left

	.-group
		display: flex
		flex-direction: row
		margin-bottom: 0

	::v-deep(.form-control)
		flex: auto

	::v-deep(.control-label)
		flex: none
		text-align: right
		line-height: $input-height-base
		width: 100px
		margin-right: $grid-gutter-width

		@media $media-sm-up
			width: $thumbnail-width

	.user-display-name
		margin-left: $input-height-base + $grid-gutter-width
		line-height: $input-height-base

	.-group-amount
		::v-deep(.form-control-prefix)
			flex: none
			width: 80px
			margin-right: 10px

			@media $media-sm-up
				width: 120px

	::v-deep(.form-group)
		clear: left

	.form-errors
	.payment-methods
		margin-left: 100px + $grid-gutter-width

		@media $media-sm-up
			margin-left: $thumbnail-width + $grid-gutter-width

	.payment-methods
		clear: both
		text-align: left
</style>
