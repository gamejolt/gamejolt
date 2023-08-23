import { Model } from '../model/model.service';
import { OrderAddress } from './address/address.model';
import { OrderItem } from './item/item.model';
import { OrderPayment } from './payment/payment.model';

export class Order extends Model {
	declare hash: string;
	declare is_gift: boolean;
	declare currency_code: string;
	declare completed_on: number;
	declare amount: number;
	declare tax_amount: number;
	items: OrderItem[] = [];
	declare payments?: OrderPayment[];
	declare addresses?: OrderAddress[];

	constructor(data: any = {}) {
		super(data);

		if (data.items) {
			this.items = OrderItem.populate(data.items);
		}

		if (data.payments) {
			this.payments = OrderPayment.populate(data.payments);
		}

		if (data.addresses) {
			this.addresses = OrderAddress.populate(data.addresses);
		}
	}

	get total_amount() {
		return this.amount + this.tax_amount;
	}

	get billing_address() {
		return this.addresses?.find(item => item.type === OrderAddress.TYPE_BILLING);
	}

	get shipping_address() {
		return this.addresses?.find(item => item.type === OrderAddress.TYPE_SHIPPING);
	}

	get _is_refunded() {
		// Whether or not the whole order is refunded (all items).
		return !this.items.find(item => item.is_refunded === false);
	}
}
