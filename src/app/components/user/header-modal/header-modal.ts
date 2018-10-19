import View from '!view!./header-modal.html';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { Store } from '../../../store/index';
import { FormUserHeader } from '../../forms/user-header/header';

@View
@Component({
	components: {
		FormUserHeader,
	},
})
export default class AppUserHeaderModal extends BaseModal {
	@State
	app!: Store['app'];

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.app.user && this.app.user.header_media_item) {
			this.previousHeaderId = this.app.user.header_media_item.id;
		}
	}

	onSubmit(user: User) {
		const newHeaderId = (user.header_media_item && user.header_media_item.id) || null;
		if (this.previousHeaderId === newHeaderId) {
			this.modal.resolve(user);
		}
		this.previousHeaderId = newHeaderId;
	}
}
