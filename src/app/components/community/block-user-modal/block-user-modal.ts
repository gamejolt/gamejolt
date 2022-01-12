import { mixins, Options, Prop } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { BaseModal } from '../../../../_common/modal/base';
import { User } from '../../../../_common/user/user.model';
import FormCommunityBlock from '../../forms/community/ban/block.vue';

@Options({
	components: {
		FormCommunityBlock,
	},
})
export default class AppCommunityBlocKUserModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: Object, required: true }) user!: User;

	onFormSubmit() {
		this.modal.resolve(true);
	}
}
