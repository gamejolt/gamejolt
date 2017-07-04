import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./sketchfab.html';

import { GameSketchfab } from '../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

@View
@Component({})
export class FormGameSketchfab extends BaseForm<GameSketchfab>
	implements FormOnInit {
	@Prop(Game) game: Game;

	modelClass = GameSketchfab;
	resetOnSubmit = true;

	onInit() {
		this.setField('game_id', this.game.id);
	}
}
