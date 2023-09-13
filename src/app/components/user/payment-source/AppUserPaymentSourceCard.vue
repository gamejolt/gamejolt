<script lang="ts" setup>
import { computed, PropType } from 'vue';
import AppCard from '../../../../_common/card/AppCard.vue';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import {
	$removePaymentSource,
	PaymentSourceModel,
} from '../../../../_common/payment-source/payment-source.model';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAddressDetails from '../address/AppUserAddressDetails.vue';

const props = defineProps({
	paymentSource: {
		type: Object as PropType<PaymentSourceModel>,
		required: true,
	},
	showRemove: {
		type: Boolean,
	},
});

const emit = defineEmits({
	remove: () => true,
});

const expires = computed(() => {
	return props.paymentSource.exp_month + '/' + props.paymentSource.exp_year;
});

async function remove() {
	const result = await showModalConfirm($gettext(`Are you sure you want to remove this card?`));
	if (!result) {
		return;
	}

	await $removePaymentSource(props.paymentSource);

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
