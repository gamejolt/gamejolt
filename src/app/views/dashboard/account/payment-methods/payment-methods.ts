import View from '!view!./payment-methods.html';
import { Component } from 'vue-property-decorator';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { PaymentSource } from '../../../../../lib/gj-lib-client/components/payment-source/payment-source.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteMutation, RouteStore } from '../account.store';
import { AppCreditCard } from '../../../../../lib/gj-lib-client/components/payment-source/credit-card';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ModalCreditCardRemove } from '../../../../../lib/gj-lib-client/components/payment-source/credit-card-remove-modal/credit-card-remove-modal-service';

@View
@Component({
	name: 'RouteDashAccountPaymentMethods',
	components: {
		AppCreditCard,
	},
})
export default class RouteDashAccountPaymentMethods extends BaseRouteComponent {
	@RouteMutation setHeading: RouteStore['setHeading'];

	paymentSources: PaymentSource[] = [];

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/payment-methods');
	}

	get routeTitle() {
		return this.$gettext(`Payment Methods`);
	}

	get hasPaymentSources() {
		return this.paymentSources.length > 0;
	}

	routeInit() {
		this.setHeading(this.$gettext('Payment Methods'));
	}

	routed($payload: any) {
		this.paymentSources = PaymentSource.populate($payload.paymentSources);
	}

	async onRemove(_e: Event, id: number) {
		const source = this.paymentSources.find(s => s.id === id);

		if (!source) {
			return;
		}

		const result = await ModalCreditCardRemove.show(
			this.$gettext(`Are you sure you want to remove this Credit Card?`),
			source,
			'Confirm...',
			'yes'
		);

		if (!result) {
			return;
		}

		const response = await source.$remove();
		if (response.success) {
			this.paymentSources = PaymentSource.populate(response.paymentSources);
			Growls.success(
				this.$gettext('The Credit Card has been successfully removed.'),
				this.$gettext('Remove Credit Card')
			);
		} else {
			Growls.error(
				this.$gettext('Failed to remove the Credit Card.'),
				this.$gettext('Error')
			);
		}
	}
}
