import { Model } from '~common/model/model.service';

export const OrderAddressTypeBilling = 'billing';
export const OrderAddressTypeShipping = 'shipping';

export type OrderAddressType = typeof OrderAddressTypeBilling | typeof OrderAddressTypeShipping;

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
