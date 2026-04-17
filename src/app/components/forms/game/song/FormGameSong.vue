<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import { formatNumber } from '~common/filters/number';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlUpload from '~common/form-vue/controls/upload/AppFormControlUpload.vue';
import { validateFilesize, validateMaxLength } from '~common/form-vue/validators';
import { GameModel } from '~common/game/game.model';
import { $saveGameSong, GameSongModel } from '~common/game/song/song.model';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type FormModel = GameSongModel;

type Props = {
	game: GameModel;
	model?: GameSongModel;
};

const props = defineProps<Props>();
const { game } = props;

const emit = defineEmits<{
	submit: [song: GameSongModel];
}>();

const maxFilesize = ref(0);

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
	modelClass: GameSongModel,
	modelSaveHandler: $saveGameSong,
	warnOnDiscard: false,
	loadUrl: computed(() => `/web/dash/developer/games/music/save/${game.id}`),
	onInit() {
		form.formModel.game_id = game.id;
	},
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const fileLabel = computed(() => {
	if (form.method === 'add') {
		return $gettext('Song File');
	}
	return $gettext('Change Song File');
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="title" :label="$gettext(`Song Title`)">
			<AppFormControl type="text" :validators="[validateMaxLength(150)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="file" :label="fileLabel" :optional="form.method === 'edit'">
			<p class="help-block">
				<AppTranslate
					:translate-params="{
						maxFilesize: formatNumber(maxFilesize / 1024 / 1024),
					}"
				>
					Song uploads are currently capped at %{ maxFilesize }MB per file. Only MP3s are
					supported at this time.
				</AppTranslate>
			</p>

			<AppFormControlUpload :validators="[validateFilesize(maxFilesize)]" accept=".mp3" />

			<AppFormControlErrors :label="$gettext(`song`)" />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Save Song</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
