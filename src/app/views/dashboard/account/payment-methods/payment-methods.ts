import View from '!view!./payment-methods.html';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { PaymentSource } from '../../../../../lib/gj-lib-client/components/payment-source/payment-source.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { arrayRemove } from '../../../../../lib/gj-lib-client/utils/array';
import { AppUserPaymentSourceCard } from '../../../../components/user/payment-source/card/card';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@View
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
