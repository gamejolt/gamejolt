import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./edit-modal.html';

import { Store } from '../../../../../store/index';
import { BaseModal } from '../../../../../../lib/gj-lib-client/components/modal/base';
import { FormAvatar } from '../../../../../components/forms/avatar/avatar';

@View
@Component({
	components: {
		FormAvatar,
	},
})
export default class AppDashAccountAvatarEditModal extends BaseModal {
	@State app: Store['app'];
}
