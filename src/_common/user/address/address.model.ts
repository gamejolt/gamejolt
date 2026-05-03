import { Model } from '~common/model/model.service';

export const UserAddressTypeBilling = 'billing';
export const UserAddressTypeShipping = 'shipping';

export type UserAddressType = typeof UserAddressTypeBilling | typeof UserAddressTypeShipping;

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
