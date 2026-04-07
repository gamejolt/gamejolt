<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { GameModel } from '../../../../../_common/game/game.model';
import {
	$saveGameScreenshot,
	GameScreenshotModel,
} from '../../../../../_common/game/screenshot/screenshot.model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

type Props = {
	game: GameModel;
	model?: GameScreenshotModel;
};

const props = defineProps<Props>();
const { game } = props;

const maxFilesize = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const form: FormController<GameScreenshotModel> = createForm({
	model: toRef(props, 'model'),
	modelClass: GameScreenshotModel,
	modelSaveHandler: $saveGameScreenshot,
	resetOnSubmit: true,
	loadUrl: computed(() => `/web/dash/developer/games/media/save/image/${game.id}`),
	onInit() {
		form.formModel.game_id = game.id;
	},
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		maxWidth.value = payload.maxWidth;
		maxHeight.value = payload.maxHeight;
	},
});

function imagesSelected() {
	// When images are selected, submit the form immediately.
	form.submit();
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			v-if="form.method === 'add'"
			name="file"
			:label="$gettext(`Image File`)"
			:hide-label="true"
		>
			<p v-translate class="help-block">
				<AppTranslate>Your image must be a PNG or JPG.</AppTranslate>
				<br />
				<strong>
					<AppTranslate>
						PNGs are highly recommended as they produce a lossless image.
					</AppTranslate>
				</strong>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				:multiple="true"
				@changed="imagesSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`selection of images`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="form.method !== 'add'"
			name="caption"
			:label="$gettext(`Caption`)"
			:optional="true"
		>
			<AppFormControl type="text" :validators="[validateMaxLength(200)]" />
			<AppFormControlErrors />
			<p class="help-block">
				<AppTranslate>
					This caption will appear when your image is viewed in full screen.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton v-if="form.method === 'edit'" show-when-valid>
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
