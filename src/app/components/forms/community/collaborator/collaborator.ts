import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import { Community } from '../../../../../_common/community/community.model';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class FormCommunityCollaborator extends BaseForm<Collaborator>
	implements FormOnInit {
	modelClass = Collaborator;
	saveMethod = '$invite' as '$invite';
	resetOnSubmit = true;

	@Prop(Community)
	community!: Community;

	readonly Collaborator = Collaborator;

	onInit() {
		this.setField('resource', 'Community');
		this.setField('resource_id', this.community.id);

		if (this.model) {
			this.setField('username', this.model.user!.username);
		}
	}
}
