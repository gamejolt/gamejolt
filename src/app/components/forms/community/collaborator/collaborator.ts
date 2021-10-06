import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlPrefixedInput from '../../../../../_common/form-vue/control/prefixed-input/prefixed-input.vue';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';

@Component({
	components: {
		AppFormControlPrefixedInput,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class FormCommunityCollaborator extends BaseForm<Collaborator>
	implements FormOnInit {
	modelClass = Collaborator;
	saveMethod = '$invite' as const;
	resetOnSubmit = true;

	@Prop(propRequired(Community)) community!: Community;

	readonly Collaborator = Collaborator;

	onInit() {
		this.setField('resource', 'Community');
		this.setField('resource_id', this.community.id);

		if (this.model) {
			this.setField('username', this.model.user!.username);
		}
	}
}
