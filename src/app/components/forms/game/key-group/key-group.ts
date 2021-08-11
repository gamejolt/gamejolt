import { Options, Prop } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { number } from '../../../../../_common/filters/number';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { KeyGroup } from '../../../../../_common/key-group/key-group.model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
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
export default class FormGameKeyGroup
	extends BaseForm<KeyGroup>
	implements FormOnInit, FormOnSubmitSuccess
{
	modelClass = KeyGroup;
	resetOnSubmit = true;

	@Prop(Game) game!: Game;

	@Prop(Array) packages!: GamePackage[];

	number = number;
	KeyGroup = KeyGroup;
	GamePackage = GamePackage;

	get arePackagesChosen() {
		return this.formModel.package_ids.length > 0;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onSubmitSuccess(response: any): void {
		this.game.assign(response.game);
	}
}
