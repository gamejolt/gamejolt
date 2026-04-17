<script lang="ts" setup>
import { toRef } from 'vue';

import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validateMaxLength } from '~common/form-vue/validators';
import { $saveGamePlaylist, GamePlaylistModel } from '~common/game-playlist/game-playlist.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = GamePlaylistModel;

type Props = {
	model?: GamePlaylistModel;
};
const { model } = defineProps<Props>();

const emit = defineEmits<{
	submit: [model: GamePlaylistModel, response: any];
}>();

const form: FormController<FormModel> = createForm<FormModel>({
	modelClass: GamePlaylistModel,
	modelSaveHandler: $saveGamePlaylist,
	model: toRef(() => model),
	onSubmitSuccess(response) {
		emit('submit', form.formModel, response);
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext('Name')">
			<AppFormControl type="text" :validators="[validateMaxLength(100)]" focus />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate v-if="form.method === 'add'">Add Playlist</AppTranslate>
			<AppTranslate v-else>Save Playlist</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
