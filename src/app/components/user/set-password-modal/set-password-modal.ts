import { Component } from 'vue-property-decorator';
import * as View from '!view!./set-password-modal.html';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormSetPassword } from '../../forms/set-password/set-password';

@View
@Component({
	components: {
		AppJolticon,
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
