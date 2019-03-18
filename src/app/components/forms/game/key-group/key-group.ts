import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { BaseForm, FormOnInit, FormOnSubmitSuccess } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { KeyGroup } from 'game-jolt-frontend-lib/components/key-group/key-group.model';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component, Prop } from 'vue-property-decorator';


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
export default class FormGameKeyGroup extends BaseForm<KeyGroup>
	implements FormOnInit, FormOnSubmitSuccess {
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
