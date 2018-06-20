import View from '!view!./edit-modal.html';
import { Component, Prop } from 'vue-property-decorator';
import { FormAddress } from '../../../forms/address/address';
import { UserAddress } from '../../../../../lib/gj-lib-client/components/user/address/address.model';
import { BaseModal } from '../../../../../lib/gj-lib-client/components/modal/base';

@View
@Component({
	components: {
		FormAddress,
	},
})
export default class AppUserAddressEditModal extends BaseModal {
	@Prop(UserAddress) address: UserAddress;

	onSaved(address: UserAddress) {
		this.modal.resolve(address);
	}
}
