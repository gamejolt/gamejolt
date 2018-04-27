import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./edit-modal.html';

import { Store } from '../../../../../store/index';
import { FormUserHeader } from '../../../../../components/forms/user-header/header';
import { ModalConfirm } from '../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { BaseModal } from '../../../../../../lib/gj-lib-client/components/modal/base';

@View
@Component({
	components: {
		FormUserHeader,
	},
})
export default class AppDashAccountHeaderEditModal extends BaseModal {
	@State app: Store['app'];

	async clearHeader() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your profile header?`),
			undefined,
			'yes'
		);
		if (result) {
			this.app.user!.$clearHeader();
		}
	}
}
