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

	$remove() {
		return this.$_remove('/web/dash/addresses/remove/' + this.id);
	}

	$save() {
		return this.$_save('/web/dash/addresses/save/' + this.id, 'userAddress');
	}
}
