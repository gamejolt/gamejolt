import { Collaborator } from 'game-jolt-frontend-lib/components/collaborator/collaborator.model';
import { AppFocusWhen } from 'game-jolt-frontend-lib/components/form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Component, Prop } from 'vue-property-decorator';

@Component({
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
