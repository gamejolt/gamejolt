import { UserAddress } from '../../components/user/address/address.model';
import { Model } from '../model/model.service';

export class PaymentSource extends Model {
	last4!: string;
	brand!: string;
	exp_month!: number;
	exp_year!: number;
	created_on!: number;
	user_address?: UserAddress;

	constructor(data: any = {}) {
		super(data);

		if (data.user_address) {
			this.user_address = new UserAddress(data.user_address);
		}
	}

	$remove() {
		return this.$_remove('/web/dash/payment-methods/remove/' + this.id);
	}
}

Model.create(PaymentSource);
