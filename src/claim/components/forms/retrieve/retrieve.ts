import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { Game } from '../../../../_common/game/game.model';

class Wrapper extends BaseForm<any> {}

@Options({})
export default class FormRetrieve extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(String) keyId!: string;
	@Prop(Object) bundle!: GameBundle;
	@Prop(Object) game!: Game;

	created() {
		this.form.warnOnDiscard = false;
	}

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
