import { Model } from '~common/model/model.service';
import { OrderPaymentRefundModel } from '~common/order/payment/refund/refund.model';

export const OrderPaymentMethodCCStripe = 'cc-stripe';
export const OrderPaymentMethodPaypal = 'paypal';
export const OrderPaymentMethodAmazon = 'amazon';
export const OrderPaymentMethodWallet = 'wallet';

export type OrderPaymentMethod =
	| typeof OrderPaymentMethodCCStripe
	| typeof OrderPaymentMethodPaypal
	| typeof OrderPaymentMethodAmazon
	| typeof OrderPaymentMethodWallet;

export class OrderPaymentModel extends Model {
	declare order_id: number;
	declare method: string;
	declare currency_code: string;
	declare amount: number;
	declare stripe_payment_source: any | null;
	declare paypal_email_address: string | null;
	refunds: OrderPaymentRefundModel[] = [];

	constructor(data: any = {}) {
		super(data);

		if (data.refunds) {
			this.refunds = OrderPaymentRefundModel.populate(data.refunds);
		}
	}
}
