<script lang="ts" setup>
import { computed, ref, toRef, watch } from 'vue';

import {
	$saveCommunityThumbnail,
	CommunityModel,
} from '../../../../../_common/community/community.model';
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
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { TranslateDirective as vTranslate } from '../../../../../_common/translate/translate-directive';

type FormModel = CommunityModel & {
	thumbnail_crop?: any;
};

const props = defineProps({
	model: {
		type: Object as () => CommunityModel,
		default: undefined,
	},
});

const maxFilesize = ref(0);
const minSize = ref(0);
const maxSize = ref(0);

const crop = computed(() =>
	form.formModel.thumbnail ? form.formModel.thumbnail.getCrop() : undefined
);

const form: FormController<FormModel> = createForm({
	modelClass: CommunityModel,
	modelSaveHandler: $saveCommunityThumbnail,
	model: toRef(props, 'model'),
	warnOnDiscard: false,
	reloadOnSubmit: true,
	loadUrl: computed(() => `/web/dash/communities/design/save-thumbnail/${props.model!.id}`),
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		minSize.value = payload.minSize;
		maxSize.value = payload.maxSize;
	},
	onBeforeSubmit() {
		// Backend expects this field.
		(form.formModel as any).crop = form.formModel.thumbnail_crop;
	},
});

watch(crop, () => {
	form.formModel.thumbnail_crop = crop.value;
});

function thumbnailSelected() {
	if (form.formModel.file) {
		form.submit();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="$gettext(`Upload New Thumbnail`)"
			:optional="!!form.formModel.thumbnail"
		>
			<p class="help-block">
				<AppTranslate>Your image must be a PNG or JPG.</AppTranslate>
				<br />
				<strong>
					<AppTranslate>
						PNGs are highly recommended as they produce a lossless image.
					</AppTranslate>
				</strong>
			</p>
			<p v-translate="{ dimensions: '1000×1000' }" class="help-block strong">
				The recommended size for a community thumbnail is
				<code>%{dimensions}</code>
				.
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minSize, height: minSize }),
					validateImageMaxDimensions({ width: maxSize, height: maxSize }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="thumbnailSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`thumbnail`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="form.formModel.thumbnail && !form.formModel.file"
			name="thumbnail_crop"
			:label="$gettext('Your Uploaded Thumbnail')"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="form.formModel.thumbnail.img_url"
					:aspect-ratio="1"
					:min-width="minSize"
					:min-height="minSize"
					:max-width="maxSize"
					:max-height="maxSize"
				/>

				<AppFormControlErrors :label="$gettext('crop')" />
			</div>
		</AppFormGroup>

		<template v-if="form.formModel.thumbnail && form.valid">
			<div>
				<AppFormButton>
					<AppTranslate>Save</AppTranslate>
				</AppFormButton>
			</div>
		</template>
	</AppForm>
</template>
