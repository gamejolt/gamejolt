import { Model } from '../../model/model.service';

export const enum OrderAddressType {
	Billing = 'billing',
	Shipping = 'shipping',
}

export class OrderAddressModel extends Model {
	declare order_id: number;
	declare type: OrderAddressType;
	declare fullname: string | null;
	declare street1: string | null;
	declare street2: string | null;
	declare city: string | null;
	declare region: string | null;
	declare postcode: string | null;
	declare country: string | null;

	constructor(data: any = {}) {
		super(data);
	}
}
