import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component } from 'vue-property-decorator';
import FormSetPassword from '../../forms/set-password/set-password.vue';


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
