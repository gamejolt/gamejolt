import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GameScoreTable } from 'game-jolt-frontend-lib/components/game/score-table/score-table.model';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppFormControlToggle,
	},
})
export default class FormGameScoreTable extends BaseForm<GameScoreTable> implements FormOnInit {
	@Prop(Game) game!: Game;

	modelClass = GameScoreTable;
	GameScoreTable = GameScoreTable;

	onInit() {
		this.setField('game_id', this.game.id);

		if (this.method === 'add') {
			this.setField('unique_scores', true);
			this.setField('scores_sorting_direction', GameScoreTable.SORTING_DIRECTION_DESC);
		}
	}
}
