import { Model } from '../model/model.service';
import { OrderAddressModel, OrderAddressType } from './address/address.model';
import { OrderItemModel } from './item/item.model';
import { OrderPaymentModel } from './payment/payment.model';

export class OrderModel extends Model {
	declare hash: string;
	declare is_gift: boolean;
	declare currency_code: string;
	declare completed_on: number;
	declare amount: number;
	declare tax_amount: number;
	items: OrderItemModel[] = [];
	declare payments?: OrderPaymentModel[];
	declare addresses?: OrderAddressModel[];

	constructor(data: any = {}) {
		super(data);

		if (data.items) {
			this.items = OrderItemModel.populate(data.items);
		}

		if (data.payments) {
			this.payments = OrderPaymentModel.populate(data.payments);
		}

		if (data.addresses) {
			this.addresses = OrderAddressModel.populate(data.addresses);
		}
	}

	get total_amount() {
		return this.amount + this.tax_amount;
	}

	get billing_address() {
		return this.addresses?.find(item => item.type === OrderAddressType.Billing);
	}

	get shipping_address() {
		return this.addresses?.find(item => item.type === OrderAddressType.Shipping);
	}

	get _is_refunded() {
		// Whether or not the whole order is refunded (all items).
		return !this.items.find(item => item.is_refunded === false);
	}
}
