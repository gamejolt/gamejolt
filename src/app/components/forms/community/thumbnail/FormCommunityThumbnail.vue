<script lang="ts" setup>
import { ref, toRef, toRefs, watch } from 'vue';
import {
	$saveCommunityThumbnail,
	CommunityModel,
} from '../../../../../_common/community/community.model';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../../_common/form-vue/AppForm.vue';
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

type FormModel = CommunityModel & {
	thumbnail_crop?: any;
	crop?: any;
};

const props = defineProps({
	...defineFormProps<CommunityModel>(true),
});

const emit = defineEmits({
	submit: (_model: CommunityModel) => true,
});

const { model } = toRefs(props);

const maxFilesize = ref(0);
const minSize = ref(0);
const maxSize = ref(0);

const crop = toRef(() =>
	form.formModel.thumbnail ? form.formModel.thumbnail.getCrop() : undefined
);

watch(crop, () => {
	form.formModel.thumbnail_crop = crop.value;
});

const form: FormController<FormModel> = createForm({
	model,
	modelClass: CommunityModel,
	modelSaveHandler: $saveCommunityThumbnail,
	warnOnDiscard: false,
	reloadOnSubmit: true,
	loadUrl: `/web/dash/communities/design/save_thumbnail/${model.value!.id}`,
	onLoad(payload) {
		maxFilesize.value = payload.maxFilesize;
		minSize.value = payload.minSize;
		maxSize.value = payload.maxSize;
	},
	onBeforeSubmit() {
		// Backend expects this field.
		form.formModel.crop = form.formModel.thumbnail_crop;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
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
				{{ $gettext(`Your image must be a PNG or JPG.`) }}
				<br />
				<strong>
					{{ $gettext(`PNGs are highly recommended as they produce a lossless image.`) }}
				</strong>
			</p>
			<p class="help-block strong">
				{{ $gettext(`The recommended size for a community thumbnail is`) }}
				<code>1000×1000</code>
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
					{{ $gettext(`Save`) }}
				</AppFormButton>
			</div>
		</template>
	</AppForm>
</template>
