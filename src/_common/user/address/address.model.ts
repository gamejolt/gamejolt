import { Model } from '../../model/model.service';

export class UserAddressModel extends Model {
	static readonly TYPE_BILLING = 'billing';
	static readonly TYPE_SHIPPING = 'shipping';

	user_id!: number;
	type!: 'billing' | 'shipping';
	fullname!: string;
	street1!: string;
	street2!: string;
	city!: string;
	region!: string;
	postcode!: string;
	country!: string;
}

export function $removeUserAddress(model: UserAddressModel) {
	return model.$_remove('/web/dash/addresses/remove/' + model.id);
}

export function $saveUserAddress(model: UserAddressModel) {
	return model.$_save('/web/dash/addresses/save/' + model.id, 'userAddress');
}
