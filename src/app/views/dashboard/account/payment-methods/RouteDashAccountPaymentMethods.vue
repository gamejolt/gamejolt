<script lang="ts">
import { ref, toRef } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { PaymentSourceModel } from '../../../../../_common/payment-source/payment-source.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../utils/array';
import AppUserPaymentSourceCard from '../../../../components/user/payment-source/AppUserPaymentSourceCard.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';
export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/dash/payment-methods'),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const paymentSources = ref<PaymentSourceModel[]>([]);

const hasPaymentSources = toRef(() => paymentSources.value.length > 0);

function onRemove(source: PaymentSourceModel) {
	arrayRemove(paymentSources.value, i => i.id === source.id);
}

const { isBootstrapped } = createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext(`Payment Methods`);
	},
	onResolved({ payload }) {
		paymentSources.value = PaymentSourceModel.populate(payload.paymentSources);
	},
});
</script>

<template>
	<div v-if="isBootstrapped" class="row">
		<template v-if="hasPaymentSources">
			<div v-for="paymentSource of paymentSources" :key="paymentSource.id" class="col-md-6">
				<AppUserPaymentSourceCard
					:payment-source="paymentSource"
					show-remove
					@remove="onRemove(paymentSource)"
				/>
			</div>
		</template>
		<template v-else>
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					{{ $gettext(`You do not have any payment methods saved yet.`) }}
				</p>
			</div>
		</template>
	</div>
</template>
