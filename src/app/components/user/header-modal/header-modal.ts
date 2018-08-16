import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./header-modal.html';

import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { Store } from '../../../store/index';
import { FormUserHeader } from '../../forms/user-header/header';
import { ModalConfirm } from '../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';

@View
@Component({
	components: {
		FormUserHeader,
	},
})
export default class AppUserHeaderModal extends BaseModal {
	@State app!: Store['app'];

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
