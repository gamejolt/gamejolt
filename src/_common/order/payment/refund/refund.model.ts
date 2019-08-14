import { Model } from '../../../model/model.service';

export class OrderPaymentRefund extends Model {
	order_id!: number;
	order_payment_id!: number;
	created_on!: number;

	constructor(data: any = {}) {
		super(data);
	}
}

Model.create(OrderPaymentRefund);
