<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { GameModel } from '../../../../../_common/game/game.model';
import {
	$saveGameScoreTable,
	GameScoreTableModel,
} from '../../../../../_common/game/score-table/score-table.model';

class Wrapper extends BaseForm<GameScoreTableModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormGameScoreTable extends mixins(Wrapper) {
	@Prop(Object) game!: GameModel;

	modelClass = GameScoreTableModel;
	modelSaveHandler = $saveGameScoreTable;

	readonly GameScoreTable = GameScoreTableModel;

	onInit() {
		this.setField('game_id', this.game.id);

		if (this.method === 'add') {
			this.setField('unique_scores', true);
			this.setField('scores_sorting_direction', GameScoreTableModel.SORTING_DIRECTION_DESC);
		}
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext(`Name`)">
			<AppFormControl type="text" :validators="[validateMaxLength(50)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :optional="true" :label="$gettext(`Description`)">
			<AppFormControlTextarea rows="5" :validators="[validateMaxLength(250)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="allow_guest_scores" :label="$gettext(`Guest Scoring`)">
			<p class="help-block">
				<AppTranslate>Allow guests to submit scores?</AppTranslate>
			</p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormGroup name="unique_scores" :label="$gettext(`Unique Scores`)">
			<p class="help-block"><AppTranslate>Only show a user's best score?</AppTranslate></p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormGroup name="scores_sorting_direction" :label="$gettext(`Sort Direction`)">
			<div class="radio">
				<label>
					<AppFormControlRadio :value="GameScoreTable.SORTING_DIRECTION_DESC" />
					<AppTranslate translate-comment="As in going from highest to lowest">
						Descending
					</AppTranslate>
					<br />
					<span class="help-inline">
						<AppTranslate>Scores with higher values are ranked better.</AppTranslate>
					</span>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="GameScoreTable.SORTING_DIRECTION_ASC" />
					<AppTranslate translate-comment="As in going from lowest to highest">
						Ascending
					</AppTranslate>
					<br />
					<span class="help-inline">
						<AppTranslate>Scores with lower values are ranked better.</AppTranslate>
					</span>
				</label>
			</div>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Save Scoreboard</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
