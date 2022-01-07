import { mixins, Options, Prop } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import { BaseForm, FormOnSubmitSuccess } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { KeyGroup } from '../../../../../_common/key-group/key-group.model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

class Wrapper extends BaseForm<KeyGroup> {}

@Options({
	components: {
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
})
export default class FormGameKeyGroup extends mixins(Wrapper) implements FormOnSubmitSuccess {
	modelClass = KeyGroup;

	@Prop(Game) game!: Game;
	@Prop(Array) packages!: GamePackage[];

	readonly formatNumber = formatNumber;
	readonly KeyGroup = KeyGroup;
	readonly GamePackage = GamePackage;

	get arePackagesChosen() {
		return this.formModel.package_ids.length > 0;
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onSubmitSuccess(response: any): void {
		this.game.assign(response.game);
	}
}
