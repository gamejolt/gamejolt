import { Component, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { Game } from '../../../../_common/game/game.model';

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
