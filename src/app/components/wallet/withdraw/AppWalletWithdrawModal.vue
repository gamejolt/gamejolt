<script lang="ts" setup>
import { ref } from 'vue';

import FormWithdrawFunds from '~app/components/forms/withdraw-funds/FormWithdrawFunds.vue';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppLoading from '~common/loading/AppLoading.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { run } from '~utils/utils';

const modal = useModal()!;

const isLoading = ref(true);
const paypalId = ref<string>();
const paypalEmail = ref<string>();
const minAmount = ref(0);
const withdrawableAmount = ref(0);

run(async () => {
	isLoading.value = false;

	const payload = await Api.sendFieldsRequest(
		'/mobile/me',
		{
			marketplaceWithdrawableMinimum: true,
			marketplaceWalletBalance: true,
			paypalId: true,
			paypalEmail: true,
		},
		{ detach: true }
	);

	paypalId.value = payload.paypalId;
	paypalEmail.value = payload.paypalEmail;
	minAmount.value = payload.marketplaceWithdrawableMinimum;
	withdrawableAmount.value = payload.marketplaceWalletBalance;
});

function onSubmit() {
	showSuccessGrowl({
		title: $gettext(`Request Sent`),
		message: $gettext(
			`Your request has been sent and will be processed within 3 days. At the time it's processed, your balance will be updated to reflect the changes.`
		),
		sticky: true,
	});

	modal.resolve();
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate>Withdraw Funds</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="isLoading">
				<AppLoading centered big stationary />
			</template>
			<template v-else>
				<FormWithdrawFunds
					:paypal-id="paypalId"
					:paypal-email="paypalEmail"
					:min-amount="minAmount"
					:withdrawable-amount="withdrawableAmount / 100"
					@submit="onSubmit()"
				/>
			</template>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped></style>
