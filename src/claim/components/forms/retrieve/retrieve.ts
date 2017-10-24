import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./retrieve.html';

import {
	BaseForm,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { GameBundle } from '../../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

@View
@Component({})
export class FormRetrieve extends BaseForm<any> implements FormOnSubmit {
	@Prop(String) keyId: string;
	@Prop(GameBundle) bundle: GameBundle;
	@Prop(Game) game: Game;

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
