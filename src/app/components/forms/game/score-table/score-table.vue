<script lang="ts">
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
	@Prop(Object) game!: Game;

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
</script>

<template>
	<AppFormGroup :controller="form">
		<AppFormGroup name="name" :label="$gettext(`dash.games.scoreboard.form.name_label`)">
			<AppFormControl type="text" :validators="[validateMaxLength(50)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			name="description"
			:optional="true"
			:label="$gettext(`dash.games.scoreboard.form.description_label`)"
		>
			<AppFormControlTextarea rows="5" :validators="[validateMaxLength(250)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			name="allow_guest_scores"
			:label="$gettext(`dash.games.scoreboard.form.guest_label`)"
		>
			<p class="help-block"><AppTranslate>dash.games.scoreboard.form.guest_help</AppTranslate></p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormGroup
			name="unique_scores"
			:label="$gettext(`dash.games.scoreboard.form.unique_label`)"
		>
			<p class="help-block"><AppTranslate>Only show a user's best score?</AppTranslate></p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormGroup
			name="scores_sorting_direction"
			:label="$gettext(`dash.games.scoreboard.form.direction_label`)"
		>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="GameScoreTable.SORTING_DIRECTION_DESC" />
					<AppTranslate translate-comment="As in going from highest to lowest">
						Descending
					</AppTranslate>
					<br />
					<span class="help-inline">
						<AppTranslate>dash.games.scoreboard.form.desc_help</AppTranslate>
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
						<AppTranslate>dash.games.scoreboard.form.asc_help</AppTranslate>
					</span>
				</label>
			</div>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>dash.games.scoreboard.form.save_button</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
