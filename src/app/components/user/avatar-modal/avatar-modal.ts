import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import { useCommonStore } from '../../../../_common/store/common-store';
import FormAvatar from '../../forms/avatar/avatar.vue';

@Options({
	components: {
		FormAvatar,
	},
})
export default class AppUserAvatarModal extends mixins(BaseModal) {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
}
