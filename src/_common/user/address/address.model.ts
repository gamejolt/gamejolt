import { Model } from '../../model/model.service';

export const enum UserAddressType {
	Billing = 'billing',
	Shipping = 'shipping',
}

export class UserAddressModel extends Model {
	declare user_id: number;
	declare type: UserAddressType;
	declare fullname: string;
	declare street1: string;
	declare street2: string;
	declare city: string;
	declare region: string;
	declare postcode: string;
	declare country: string;
}

export function $removeUserAddress(model: UserAddressModel) {
	return model.$_remove('/web/dash/addresses/remove/' + model.id);
}

export function $saveUserAddress(model: UserAddressModel) {
	return model.$_save('/web/dash/addresses/save/' + model.id, 'userAddress');
}
