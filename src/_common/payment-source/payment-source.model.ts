import { Model } from '../model/model.service';
import { UserAddressModel } from '../user/address/address.model';

export class PaymentSourceModel extends Model {
	declare last4: string;
	declare brand: string;
	declare exp_month: number;
	declare exp_year: number;
	declare created_on: number;
	declare user_address?: UserAddressModel;

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
