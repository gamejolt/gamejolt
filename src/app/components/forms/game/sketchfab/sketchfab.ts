import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GameSketchfab } from 'game-jolt-frontend-lib/components/game/sketchfab/sketchfab.model';
import { Component, Prop } from 'vue-property-decorator';


@Component({})
export default class FormGameSketchfab extends BaseForm<GameSketchfab> implements FormOnInit {
	@Prop(Game) game!: Game;

	modelClass = GameSketchfab;
	resetOnSubmit = true;
	warnOnDiscard = false;

	onInit() {
		this.setField('game_id', this.game.id);
	}
}
