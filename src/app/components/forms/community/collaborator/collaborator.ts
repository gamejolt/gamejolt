import { mixins, Options, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import { Community } from '../../../../../_common/community/community.model';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<Collaborator> {}

@Options({
	directives: {
		AppFocusWhen,
	},
})
export default class FormCommunityCollaborator extends mixins(Wrapper) {
	modelClass = Collaborator;
	saveMethod = '$invite' as const;

	@Prop(propRequired(Community)) community!: Community;

	readonly Collaborator = Collaborator;

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('resource', 'Community');
		this.setField('resource_id', this.community.id);

		if (this.model) {
			this.setField('username', this.model.user!.username);
		}
	}
}
