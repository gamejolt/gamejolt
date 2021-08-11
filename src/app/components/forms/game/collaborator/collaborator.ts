import { Options, Prop } from 'vue-property-decorator';
import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import AppFormControlPrefixedInput from '../../../../../_common/form-vue/control/prefixed-input/prefixed-input.vue';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';

@Options({
	components: {
		AppFormControlPrefixedInput,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class FormGameCollaborator extends BaseForm<Collaborator> implements FormOnInit {
	modelClass = Collaborator;
	saveMethod = '$invite' as '$invite';
	resetOnSubmit = true;

	@Prop(Game)
	game!: Game;

	readonly Collaborator = Collaborator;

	onInit() {
		this.setField('resource', 'Game');
		this.setField('resource_id', this.game.id);

		if (this.model && this.model.user) {
			this.setField('username', this.model.user.username);
		}
	}
}
