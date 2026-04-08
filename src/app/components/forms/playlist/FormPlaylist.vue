<script lang="ts" setup>
import { PropType, toRef } from 'vue';

import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import { validateMaxLength } from '../../../../_common/form-vue/validators';
import {
	$saveGamePlaylist,
	GamePlaylistModel,
} from '../../../../_common/game-playlist/game-playlist.model';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	model: {
		type: Object as PropType<GamePlaylistModel>,
		default: undefined,
	},
});

const form: FormController<GamePlaylistModel> = createForm({
	modelClass: GamePlaylistModel,
	modelSaveHandler: $saveGamePlaylist,
	model: toRef(props, 'model'),
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
