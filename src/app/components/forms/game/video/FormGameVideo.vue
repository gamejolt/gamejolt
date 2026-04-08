<script lang="ts" setup>
import { TranslateDirective as vTranslate } from '../../../../../_common/translate/translate-directive';
import { validatePattern, validateMaxLength } from '../../../../../_common/form-vue/validators';
import AppFormControlTextarea from '../../../../../_common/form-vue/controls/AppFormControlTextarea.vue';
import { computed, toRef, watch } from 'vue';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import { GameModel } from '../../../../../_common/game/game.model';
import {
	$saveGameVideo,
	GameVideoModel,
	GameVideoType,
} from '../../../../../_common/game/video/video.model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppVideoEmbed from '../../../../../_common/video/embed/AppVideoEmbed.vue';
import { REGEX_VIDEO, REGEX_VIMEO, REGEX_YOUTUBE } from '../../../../../utils/regex';

type FormModel = GameVideoModel & {
	_url?: string;
};

type Props = {
	game: GameModel;
	model?: GameVideoModel;
};

const props = defineProps<Props>();
const { game } = props;

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
			if (form.formModel.type === GameVideoType.Vimeo) {
				form.formModel._url = 'https://www.vimeo.com/' + form.formModel.url;
			} else if (form.formModel.type === GameVideoType.Youtube) {
				form.formModel._url = 'https://www.youtube.com/watch?v=' + form.formModel.url;
			}
		}
	},
});

const videoData = computed(() => {
	const url = form.formModel._url;
	if (!url) {
		return null;
	}

	const youtubeMatch = url.match(REGEX_YOUTUBE);
	if (youtubeMatch) {
		return { id: youtubeMatch[youtubeMatch.length - 1], type: GameVideoType.Youtube };
	}

	const vimeoMatch = url.match(REGEX_VIMEO);
	if (vimeoMatch) {
		return { id: vimeoMatch[vimeoMatch.length - 1], type: GameVideoType.Vimeo };
	}

	return null;
});

const hasValidVideoUrl = computed(() => !!videoData.value);

watch(
	() => form.formModel._url,
	(url) => {
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
