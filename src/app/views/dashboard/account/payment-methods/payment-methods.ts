import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { PaymentSource } from 'game-jolt-frontend-lib/components/payment-source/payment-source.model';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { arrayRemove } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import AppUserPaymentSourceCard from '../../../../components/user/payment-source/card/card.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@Component({
	name: 'RouteDashAccountPaymentMethods',
	components: {
		AppUserPaymentSourceCard,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/payment-methods'),
	resolveStore({}) {
		routeStore.commit('setHeading', Translate.$gettext(`Payment Methods`));
	},
})
export default class RouteDashAccountPaymentMethods extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	paymentSources: PaymentSource[] = [];

	get routeTitle() {
		return this.heading;
	}

	get hasPaymentSources() {
		return this.paymentSources.length > 0;
	}

	routeResolved($payload: any) {
		this.paymentSources = PaymentSource.populate($payload.paymentSources);
	}

	onRemove(source: PaymentSource) {
		arrayRemove(this.paymentSources, i => i.id === source.id);
	}
}
