<script lang="ts" setup>
import { computed, toRef, watch } from 'vue';

import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';
import { validateMaxLength, validatePattern } from '~common/form-vue/validators';
import { GameModel } from '~common/game/game.model';
import {
	$saveGameVideo,
	GameVideoModel,
	GameVideoType,
	GameVideoTypeVimeo,
	GameVideoTypeYoutube,
} from '~common/game/video/video.model';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';
import AppVideoEmbed from '~common/video/embed/AppVideoEmbed.vue';
import { REGEX_VIDEO, REGEX_VIMEO, REGEX_YOUTUBE } from '~utils/regex';

type FormModel = GameVideoModel & {
	_url?: string;
};

type Props = {
	game: GameModel;
	model?: GameVideoModel;
};

const props = defineProps<Props>();
const { game } = props;

const emit = defineEmits<{
	submit: [video: FormModel];
}>();

const form: FormController<FormModel> = createForm({
	model: toRef(props, 'model'),
	modelClass: GameVideoModel,
	modelSaveHandler: $saveGameVideo,
	warnOnDiscard: false,
	resetOnSubmit: true,
	onInit() {
		form.formModel.game_id = game.id;

		// We use _url as the form model's URL and copy back and forth.
		if (form.formModel.url) {
			if (form.formModel.type === GameVideoTypeVimeo) {
				form.formModel._url = 'https://www.vimeo.com/' + form.formModel.url;
			} else if (form.formModel.type === GameVideoTypeYoutube) {
				form.formModel._url = 'https://www.youtube.com/watch?v=' + form.formModel.url;
			}
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const videoData = computed((): { id: string; type: GameVideoType } | null => {
	const url = form.formModel._url;
	if (!url) {
		return null;
	}

	const youtubeMatch = url.match(REGEX_YOUTUBE);
	if (youtubeMatch) {
		return { id: youtubeMatch[youtubeMatch.length - 1], type: GameVideoTypeYoutube };
	}

	const vimeoMatch = url.match(REGEX_VIMEO);
	if (vimeoMatch) {
		return { id: vimeoMatch[vimeoMatch.length - 1], type: GameVideoTypeVimeo };
	}

	return null;
});

const hasValidVideoUrl = computed(() => !!videoData.value);

watch(
	() => form.formModel._url,
	url => {
		if (url) {
			const data = videoData.value;
			if (data) {
				form.formModel.type = data.type;
				form.formModel.url = data.id;
			}
		}
	}
);
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="_url" :label="$gettext(`Video URL`)">
			<AppFormControl type="text" :validators="[validatePattern(REGEX_VIDEO)]" />

			<AppFormControlErrors :label="$gettext(`video URL`)" />

			<p v-translate class="help-block">
				We currently only support videos from Vimeo or YouTube.
				<br />
				The URL should look something like:
				<br />
				<strong>YouTube:</strong>
				<code>https://youtube.com/watch?v=oHg5SJYRHA0</code>
				<br />
				<strong>Vimeo:</strong>
				<code>https://vimeo.com/243244233</code>
			</p>
			<template v-if="hasValidVideoUrl && videoData">
				<br />
				<AppVideoEmbed :video-provider="videoData.type" :video-id="videoData.id" />
			</template>
		</AppFormGroup>

		<AppFormGroup name="title" :label="$gettext(`Title`)">
			<AppFormControl type="text" :validators="[validateMaxLength(150)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :label="$gettext(`Description`)" :optional="true">
			<AppFormControlTextarea rows="5" :validators="[validateMaxLength(2500)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton show-when-valid>
			<AppTranslate v-if="form.method === 'add'">Add</AppTranslate>
			<AppTranslate v-else-if="form.method === 'edit'">Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
