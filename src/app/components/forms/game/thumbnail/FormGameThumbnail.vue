<script lang="ts" setup>
import { computed, PropType, ref, toRef, watch } from 'vue';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlCrop from '../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
	validateImageMinDimensions,
} from '../../../../../_common/form-vue/validators';
import { GameModel } from '../../../../../_common/game/game.model';
import AppLinkHelp from '../../../../../_common/link/AppLinkHelp.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

type FormModel = GameModel & {
	thumb_crop: any;
};

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
});

const emit = defineEmits({
	submit: (_game: GameModel) => true,
});

const maxFilesize = ref(0);
const minWidth = ref(0);
const minHeight = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);
const cropAspectRatio = ref(0);

const form: FormController<FormModel> = createForm({
	modelClass: GameModel,
	model: toRef(props, 'game'),
	saveMethod: '$saveThumbnail',
	warnOnDiscard: false,
	resetOnSubmit: true,
	loadUrl: computed(() => `/web/dash/developer/games/thumbnail/save/${props.game.id}`),
	onInit() {
		form.formModel.thumb_crop = crop.value;
	},
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		minWidth.value = payload.minWidth;
		minHeight.value = payload.minHeight;
		maxWidth.value = payload.maxWidth;
		maxHeight.value = payload.maxHeight;
		cropAspectRatio.value = payload.cropAspectRatio;
	},
	onBeforeSubmit() {
		// Backend expects this field.
		(form.formModel as any).crop = form.formModel.thumb_crop;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const thumb = computed(() => form.formModel.thumbnail_media_item);
const crop = computed(() => thumb.value?.getCrop());

watch(crop, newCrop => (form.formModel.thumb_crop = newCrop));

/**
 * Old thumbnails were smaller than our current minimums. We don't want to allow
 * to crop them, but we do want to allow them to upload a new one. We check here
 * if it's too small to crop to signal to the form to remove the cropper.
 */
const canCrop = computed(() => {
	const game = props.game;

	if (!game.thumbnail_media_item) {
		return false;
	}

	if (
		game.thumbnail_media_item!.width < minWidth.value ||
		game.thumbnail_media_item.height < minHeight.value
	) {
		return false;
	}

	return true;
});

function thumbSelected() {
	if (form.formModel.file) {
		form.submit();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<!-- They are required to upload a media item if there is none set yet. -->
		<AppFormGroup
			name="file"
			:label="$gettext(`Upload New Thumbnail`)"
			:optional="thumb && canCrop"
		>
			<p v-translate class="help-block">
				Your thumbnail image must be a PNG, JPG, or GIF.
				<br />
				Animated GIFs allow gamers to get a glimpse of your game in action.
				<br />
				For still images, PNGs are recommended because they produce lossless images.
			</p>
			<p v-translate="{ dimensions: '1280×720' }" class="help-block strong">
				The recommended size for a thumbnail is
				<code>%{dimensions}</code>
				(ratio of 16 ÷ 9).
			</p>
			<p class="help-block">
				<AppLinkHelp page="dev-thumbnails" class="link-help">
					<AppTranslate>What are the thumbnail requirements and guidelines?</AppTranslate>
				</AppLinkHelp>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minWidth, height: minHeight }),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.gif,.webp"
				@changed="thumbSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`thumbnail image`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="form.isLoaded && thumb && !form.formModel.file"
			name="thumb_crop"
			:label="canCrop ? $gettext('Crop Current Thumbnail') : $gettext('Current Thumbnail')"
		>
			<div v-if="canCrop && thumb.is_animated" class="alert">
				<p>
					<AppTranslate>
						Animated thumbnails can't be cropped manually. We set a default crop for you
						instead.
					</AppTranslate>
				</p>
			</div>

			<div v-if="canCrop" class="form-control-static">
				<AppFormControlCrop
					:src="thumb.img_url"
					:aspect-ratio="cropAspectRatio"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:disabled="thumb.is_animated"
				/>

				<!-- TODO(vue3) translate-comment="As in a crop of an image" -->
				<AppFormControlErrors :label="$gettext(`crop`)" />
			</div>
			<div v-else>
				<img :src="thumb.img_url" alt="" />
			</div>
		</AppFormGroup>

		<AppFormButton v-if="thumb">
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
