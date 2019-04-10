import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { UserAddress } from 'game-jolt-frontend-lib/components/user/address/address.model';
import { Component, Prop } from 'vue-property-decorator';
import FormAddress from '../../../forms/address/address.vue';

@Component({
	components: {
		FormAddress,
	},
})
export default class AppUserAddressEditModal extends BaseModal {
	@Prop(UserAddress) address!: UserAddress;

	onSaved(address: UserAddress) {
		this.modal.resolve(address);
	}
}
