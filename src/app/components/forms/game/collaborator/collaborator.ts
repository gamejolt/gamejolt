import { mixins, Options, Prop } from 'vue-property-decorator';
import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';

class Wrapper extends BaseForm<Collaborator> {}

@Options({
	directives: {
		AppFocusWhen,
	},
})
export default class FormGameCollaborator extends mixins(Wrapper) {
	modelClass = Collaborator;
	saveMethod = '$invite' as const;

	@Prop(Object)
	game!: Game;

	readonly Collaborator = Collaborator;

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('resource', 'Game');
		this.setField('resource_id', this.game.id);

		if (this.model && this.model.user) {
			this.setField('username', this.model.user.username);
		}
	}
}
