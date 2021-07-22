import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Community } from '../../../../_common/community/community.model';
import { BaseModal } from '../../../../_common/modal/base';
import { User } from '../../../../_common/user/user.model';
import { FormModel } from '../../../components/forms/community/ban/block';
import FormCommunityBlock from '../../forms/community/ban/block.vue';

@Component({
	components: {
		FormCommunityBlock,
	},
})
export default class AppCommunityBlocKUserModal extends BaseModal {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(User)) user!: User;

	onFormSubmit(model: FormModel) {
		this.modal.resolve({ ejectPosts: model.ejectPosts });
	}
}
