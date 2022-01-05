import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../../_common/modal/base';
import { UserAddress } from '../../../../../_common/user/address/address.model';
import FormAddress from '../../../forms/address/address.vue';

@Options({
	components: {
		FormAddress,
	},
})
export default class AppUserAddressEditModal extends mixins(BaseModal) {
	@Prop(UserAddress) address!: UserAddress;

	onSaved(address: UserAddress) {
		this.modal.resolve(address);
	}
}
