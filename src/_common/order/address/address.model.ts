import { Model } from '../../model/model.service';

export class OrderAddress extends Model {
	static readonly TYPE_BILLING = 'billing';
	static readonly TYPE_SHIPPING = 'shipping';

	order_id!: number;
	type!: string;
	fullname!: string | null;
	street1!: string | null;
	street2!: string | null;
	city!: string | null;
	region!: string | null;
	postcode!: string | null;
	country!: string | null;

	constructor(data: any = {}) {
		super(data);
	}
}
