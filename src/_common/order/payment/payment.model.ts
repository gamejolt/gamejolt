import { Model } from '../../model/model.service';
import { OrderPaymentRefund } from './refund/refund.model';

export class OrderPayment extends Model {
	static readonly METHOD_CC_STRIPE = 'cc-stripe';
	static readonly METHOD_PAYPAL = 'paypal';
	static readonly METHOD_AMAZON = 'amazon';
	static readonly METHOD_WALLET = 'wallet';

	order_id!: number;
	method!: string;
	currency_code!: string;
	amount!: number;
	stripe_payment_source!: any | null;
	paypal_email_address!: string | null;
	refunds: OrderPaymentRefund[] = [];

	constructor(data: any = {}) {
		super(data);

		if (data.refunds) {
			this.refunds = OrderPaymentRefund.populate(data.refunds);
		}
	}
}

Model.create(OrderPayment);
