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
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext(`dash.games.scoreboard.form.name_label`)">
			<app-form-control type="text" :validators="[validateMaxLength(50)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="description"
			:optional="true"
			:label="$gettext(`dash.games.scoreboard.form.description_label`)"
		>
			<app-form-control-textarea rows="5" :validators="[validateMaxLength(250)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="allow_guest_scores"
			:label="$gettext(`dash.games.scoreboard.form.guest_label`)"
		>
			<p class="help-block"><translate>dash.games.scoreboard.form.guest_help</translate></p>
			<app-form-control-toggle />
		</app-form-group>

		<app-form-group
			name="unique_scores"
			:label="$gettext(`dash.games.scoreboard.form.unique_label`)"
		>
			<p class="help-block"><translate>dash.games.scoreboard.form.unique_help</translate></p>
			<app-form-control-toggle />
		</app-form-group>

		<app-form-group
			name="scores_sorting_direction"
			:label="$gettext(`dash.games.scoreboard.form.direction_label`)"
		>
			<div class="radio">
				<label>
					<app-form-control-radio :value="GameScoreTable.SORTING_DIRECTION_DESC" />
					<translate>dash.games.scoreboard.form.desc_label</translate>
					<br />
					<span class="help-inline">
						<translate>dash.games.scoreboard.form.desc_help</translate>
					</span>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="GameScoreTable.SORTING_DIRECTION_ASC" />
					<translate>dash.games.scoreboard.form.asc_label</translate>
					<br />
					<span class="help-inline">
						<translate>dash.games.scoreboard.form.asc_help</translate>
					</span>
				</label>
			</div>
		</app-form-group>

		<app-form-button>
			<translate>dash.games.scoreboard.form.save_button</translate>
		</app-form-button>
	</app-form>
</template>
