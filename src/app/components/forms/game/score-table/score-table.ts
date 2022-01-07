import { mixins, Options, Prop } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameScoreTable } from '../../../../../_common/game/score-table/score-table.model';

class Wrapper extends BaseForm<GameScoreTable> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormGameScoreTable extends mixins(Wrapper) {
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
