import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./score-table.html';

import { GameScoreTable } from '../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';

@View
@Component({
	components: {
		AppFormControlToggle,
	},
})
export class FormGameScoreTable extends BaseForm<GameScoreTable>
	implements FormOnInit {
	@Prop(Game) game: Game;

	modelClass = GameScoreTable;

	onInit() {
		this.setField('game_id', this.game.id);

		if (this.method === 'add') {
			this.setField('unique_scores', true);
			this.setField(
				'scores_sorting_direction',
				GameScoreTable.SORTING_DIRECTION_DESC
			);
		}
	}
}
