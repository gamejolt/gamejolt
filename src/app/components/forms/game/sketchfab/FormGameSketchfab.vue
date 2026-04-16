<script lang="ts" setup>
import { computed, toRef } from 'vue';

import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validatePattern } from '~common/form-vue/validators';
import { GameModel } from '~common/game/game.model';
import {
	$saveGameSketchfab,
	GameSketchfabModel,
} from '~common/game/sketchfab/sketchfab.model';
import AppSketchfabEmbed, {
	getSketchfabIdFromInput,
	SKETCHFAB_FIELD_VALIDATION_REGEX,
} from '~common/sketchfab/embed/AppSketchfabEmbed.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = GameSketchfabModel;

type Props = {
	game: GameModel;
	model?: GameSketchfabModel;
};

const props = defineProps<Props>();
const { game } = props;

const emit = defineEmits<{
	submit: [sketchfab: GameSketchfabModel];
}>();

const SKETCHFAB_FIELD_REGEX = SKETCHFAB_FIELD_VALIDATION_REGEX;

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
	modelClass: GameSketchfabModel,
	modelSaveHandler: $saveGameSketchfab,
	warnOnDiscard: false,
	resetOnSubmit: true,
	onInit() {
		form.formModel.game_id = game.id;
		if (form.formModel.sketchfab_id) {
			form.formModel.sketchfab_id =
				'https://sketchfab.com/models/' + form.formModel.sketchfab_id;
		}
	},
	onBeforeSubmit() {
		form.formModel.sketchfab_id = sketchfabId.value;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const sketchfabId = computed(() => getSketchfabIdFromInput(form.formModel.sketchfab_id));

const hasValidSketchfabModelId = computed(
	() => form.formModel.sketchfab_id && form.formModel.sketchfab_id.match(SKETCHFAB_FIELD_REGEX)
);
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="sketchfab_id" :label="$gettext(`Sketchfab Model URL`)">
			<p class="help-block">
				<AppTranslate>Enter your Sketchfab model's URL or ID. For example:</AppTranslate>
				<br />
				<code> https://sketchfab.com/3d-models/your-model-name-ID </code>
			</p>
			<AppFormControl type="text" :validators="[validatePattern(SKETCHFAB_FIELD_REGEX)]" />
			<AppFormControlErrors />
			<div v-if="hasValidSketchfabModelId">
				<br />
				<AppSketchfabEmbed :sketchfab-id="sketchfabId" />
			</div>
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<AppTranslate v-if="form.method === 'add'">Add</AppTranslate>
			<AppTranslate v-else-if="form.method === 'edit'">Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
