import { Model } from '../../model/model.service';
import { OrderPaymentRefundModel } from './refund/refund.model';

export const enum OrderPaymentMethod {
	CCStripe = 'cc-stripe',
	Paypal = 'paypal',
	Amazon = 'amazon',
	Wallet = 'wallet',
}

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
