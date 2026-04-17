<script lang="ts" setup>
import { toRef } from 'vue';

import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import { validateMaxLength } from '~common/form-vue/validators';
import { GameModel } from '~common/game/game.model';
import {
	$saveGameScoreTable,
	GameScoreTableModel,
	GameScoreTableSorting,
} from '~common/game/score-table/score-table.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = GameScoreTableModel;

type Props = {
	game: GameModel;
	model?: GameScoreTableModel;
};

const props = defineProps<Props>();
const { game } = props;

const emit = defineEmits<{
	submit: [table: GameScoreTableModel];
}>();

const DirectionAscend = GameScoreTableSorting.DirectionAsc;
const DirectionDescend = GameScoreTableSorting.DirectionDesc;

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
	modelClass: GameScoreTableModel,
	modelSaveHandler: $saveGameScoreTable,
	onInit() {
		form.formModel.game_id = game.id;

		if (form.method === 'add') {
			form.formModel.unique_scores = true;
			form.formModel.scores_sorting_direction = GameScoreTableSorting.DirectionDesc;
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});
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
					<AppFormControlRadio :value="DirectionDescend" />
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
					<AppFormControlRadio :value="DirectionAscend" />
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
