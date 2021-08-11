import { Options, Prop } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameScoreTable } from '../../../../../_common/game/score-table/score-table.model';

@Options({
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
