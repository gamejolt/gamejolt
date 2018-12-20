import View from '!view!./collaborator.html';
import { Component, Prop } from 'vue-property-decorator';
import { Collaborator } from '../../../../../lib/gj-lib-client/components/collaborator/collaborator.model';
import { AppFocusWhen } from '../../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

@View
@Component({
	directives: {
		AppFocusWhen,
	},
})
export class FormGameCollaborator extends BaseForm<Collaborator> implements FormOnInit {
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
