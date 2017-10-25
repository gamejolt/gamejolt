import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./collaborator.html';

import { GameCollaborator } from '../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({})
export class FormGameCollaborator extends BaseForm<GameCollaborator> implements FormOnInit {
	modelClass = GameCollaborator;
	saveMethod = '$invite' as '$invite';
	resetOnSubmit = true;

	@Prop(Game) game: Game;

	readonly GameCollaborator = GameCollaborator;

	onInit() {
		this.setField('game_id', this.game.id);

		if (this.model && this.model.user) {
			this.setField('username', this.model.user.username);
		}
	}
}
