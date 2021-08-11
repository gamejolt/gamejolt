import { Options } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import FormSetPassword from '../../forms/set-password/set-password.vue';

@Options({
	components: {
		FormSetPassword,
	},
})
export default class AppUserSetPasswordModal extends BaseModal {
	onPasswordSet() {
		this.modal.resolve(true);
	}

	close() {
		this.modal.dismiss();
	}
}
