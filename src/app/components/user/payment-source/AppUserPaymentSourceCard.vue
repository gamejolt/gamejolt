<script lang="ts" setup>
import { computed } from 'vue';

import AppUserAddressDetails from '~app/components/user/address/AppUserAddressDetails.vue';
import AppCard from '~common/card/AppCard.vue';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import {
	$removePaymentSource,
	PaymentSourceModel,
} from '~common/payment-source/payment-source.model';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	paymentSource: PaymentSourceModel;
	showRemove?: boolean;
};
const { paymentSource, showRemove } = defineProps<Props>();

const emit = defineEmits<{
	remove: [];
}>();

const expires = computed(() => {
	return paymentSource.exp_month + '/' + paymentSource.exp_year;
});

async function remove() {
	const result = await showModalConfirm($gettext(`Are you sure you want to remove this card?`));
	if (!result) {
		return;
	}

	await $removePaymentSource(paymentSource);

	showSuccessGrowl(
		$gettext(`Your card has successfully been removed.`),
		$gettext(`Card Removed`)
	);

	emit('remove');
}
</script>

<template>
	<AppCard class="payment-source-credit-card">
		<a v-if="showRemove" class="card-remove" @click="remove()">
			<AppJolticon icon="remove" />
		</a>

		<div class="-icon">
			<AppJolticon icon="credit-card" big />
		</div>

		<div class="-body">
			<div class="card-title">
				<h5>
					<AppTranslate>Credit Card</AppTranslate>
				</h5>
			</div>

			<div class="card-content">
				<div>
					<span class="tag">
						{{ paymentSource.brand }}
					</span>
					****
					{{ paymentSource.last4 }}

					<span class="dot-separator" />
					{{ expires }}
				</div>

				<template v-if="paymentSource.user_address">
					<br />
					<AppUserAddressDetails :address="paymentSource.user_address" />
				</template>
			</div>
		</div>
	</AppCard>
</template>

<style lang="stylus" scoped>
.-icon
	float: left

.-body
	margin-left: 70px
</style>
