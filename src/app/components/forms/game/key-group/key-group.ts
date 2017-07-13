import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./key-group.html';
import { KeyGroup } from '../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { FormOnSubmitSuccess } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({
	components: {
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class FormGameKeyGroup extends BaseForm<KeyGroup>
	implements FormOnInit, FormOnSubmitSuccess {
	modelClass = KeyGroup;
	resetOnSubmit = true;

	@Prop(Game) game: Game;

	@Prop(Array) packages: GamePackage[];

	number = number;
	KeyGroup = KeyGroup;
	GamePackage = GamePackage;

	get arePackagesChosen() {
		return this.formModel.packages.length > 0;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onSubmitSuccess(response: any): void {
		this.game.assign(response.game);
	}
}
