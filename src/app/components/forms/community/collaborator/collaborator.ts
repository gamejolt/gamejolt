import { Collaborator } from 'game-jolt-frontend-lib/components/collaborator/collaborator.model';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppFocusWhen } from 'game-jolt-frontend-lib/components/form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
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

		if (this.model && this.model.user) {
			this.setField('username', this.model.user.username);
		}
	}
}
