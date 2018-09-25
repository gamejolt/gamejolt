import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./avatar-modal.html';

import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { FormAvatar } from '../../forms/avatar/avatar';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		FormAvatar,
	},
})
export default class AppUserAvatarModal extends BaseModal {
	@State app!: Store['app'];
}
