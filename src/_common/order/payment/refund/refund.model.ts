import { Model } from '../../../model/model.service';

export class OrderPaymentRefundModel extends Model {
	declare order_id: number;
	declare order_payment_id: number;
	declare created_on: number;
}
