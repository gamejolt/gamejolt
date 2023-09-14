import { Model } from '../model/model.service';
import { UserAddressModel } from '../user/address/address.model';

export class PaymentSourceModel extends Model {
	last4!: string;
	brand!: string;
	exp_month!: number;
	exp_year!: number;
	created_on!: number;
	user_address?: UserAddressModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user_address) {
			this.user_address = new UserAddressModel(data.user_address);
		}
	}
}

export function $removePaymentSource(model: PaymentSourceModel) {
	return model.$_remove('/web/dash/payment-methods/remove/' + model.id);
}
