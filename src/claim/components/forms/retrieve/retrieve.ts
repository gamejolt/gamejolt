import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseForm, FormOnSubmit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { GameBundle } from 'game-jolt-frontend-lib/components/game-bundle/game-bundle.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Component, Prop } from 'vue-property-decorator';


@Component({})
export default class FormRetrieve extends BaseForm<any> implements FormOnSubmit {
	@Prop(String) keyId!: string;
	@Prop(GameBundle) bundle!: GameBundle;
	@Prop(Game) game!: Game;

	warnOnDiscard = false;

	onSubmit() {
		let url = '/claim/retrieve';
		if (this.bundle) {
			url += '/bundle/' + this.keyId;
		} else if (this.game) {
			url += '/game/' + this.keyId;
		}

		return Api.sendRequest(url, this.formModel);
	}
}
