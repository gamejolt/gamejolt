import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseModal } from '../../../../_common/modal/base';
import { Store } from '../../../store/index';
import FormAvatar from '../../forms/avatar/avatar.vue';

@Options({
	components: {
		FormAvatar,
	},
})
export default class AppUserAvatarModal extends BaseModal {
	@State app!: Store['app'];
}
