<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { PaymentSource } from '../../../../../_common/payment-source/payment-source.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../utils/array';
import AppUserPaymentSourceCard from '../../../../components/user/payment-source/AppUserPaymentSourceCard.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

@Options({
	name: 'RouteDashAccountPaymentMethods',
	components: {
		AppUserPaymentSourceCard,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/payment-methods'),
})
export default class RouteDashAccountPaymentMethods extends LegacyRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	paymentSources: PaymentSource[] = [];

	get routeTitle() {
		return this.routeStore.heading;
	}

	get hasPaymentSources() {
		return this.paymentSources.length > 0;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Payment Methods`);
	}

	routeResolved($payload: any) {
		this.paymentSources = PaymentSource.populate($payload.paymentSources);
	}

	onRemove(source: PaymentSource) {
		arrayRemove(this.paymentSources, i => i.id === source.id);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped" class="row">
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
					<AppTranslate>You do not have any payment methods saved yet.</AppTranslate>
				</p>
			</div>
		</template>
	</div>
</template>
