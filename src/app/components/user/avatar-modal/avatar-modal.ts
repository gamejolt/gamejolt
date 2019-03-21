import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import FormAvatar from '../../forms/avatar/avatar.vue';


@Component({
	components: {
		FormAvatar,
	},
})
export default class AppUserAvatarModal extends BaseModal {
	@State app!: Store['app'];
}
