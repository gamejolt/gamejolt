<script lang="ts" setup>
import { ref, toRef, toRefs, watch } from 'vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import {
	$clearCommunityCompetitionHeader,
	$saveCommunityCompetitionHeader,
	CommunityCompetitionModel,
} from '../../../../../../_common/community/competition/competition.model';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlCrop from '../../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
	validateImageMinDimensions,
} from '../../../../../../_common/form-vue/validators';
import AppLinkHelp from '../../../../../../_common/link/AppLinkHelp.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { $gettext } from '../../../../../../_common/translate/translate.service';

type FormModel = CommunityCompetitionModel & {
	header_crop?: any;
	crop?: any;
};

const props = defineProps({
	...defineFormProps<CommunityCompetitionModel>(true),
});

const { model } = toRefs(props);

const maxFilesize = ref(0);
const minAspectRatio = ref(0);
const maxAspectRatio = ref(0);
const minWidth = ref(0);
const minHeight = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const crop = toRef(() => (form.formModel.header ? form.formModel.header.getCrop() : undefined));

watch(crop, () => (form.formModel.header_crop = crop.value));

const form: FormController<FormModel> = createForm({
	model,
	modelClass: CommunityCompetitionModel,
	modelSaveHandler: $saveCommunityCompetitionHeader,
	loadUrl: toRef(() => `/web/dash/communities/competitions/header/save/${model.value!.id}`),
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		minAspectRatio.value = payload.minAspectRatio;
		maxAspectRatio.value = payload.maxAspectRatio;
		minWidth.value = payload.minWidth;
		maxWidth.value = payload.maxWidth;
		minHeight.value = payload.minHeight;
		maxHeight.value = payload.maxHeight;
	},
	onBeforeSubmit() {
		form.formModel.crop = form.formModel.header_crop;
	},
});

async function clearHeader() {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to remove your competition's header?`)
	);

	if (result) {
		const payload = await $clearCommunityCompetitionHeader(form.formModel);

		// Overwrite the base model's header media item here.
		// This needs to be done because this form does not resolve (and may never resolve)
		// after cleaning a header. Need to ensure that the base model's header gets cleared.
		model.value?.assign(payload.competition);
	}
}

function headerSelected() {
	if (form.formModel.file) {
		form.submit();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="$gettext(`Upload New Header`)"
			:optional="!!form.formModel.header"
		>
			<p class="help-block">
				{{
					$gettext(
						`Headers are the big, banner-like images that adorn the tops of pages. For your header to look its best on all devices, make sure anything important is located near the center of the image.`
					)
				}}
			</p>
			<p class="help-block">
				{{ $gettext(`Your image must be a PNG or JPG.`) }}
				<br />
				<strong>
					{{ $gettext(`PNGs are highly recommended as they produce a lossless image.`) }}
				</strong>
			</p>
			<p class="help-block strong">
				{{ $gettext(`The recommended size for a header image is`) }}
				{{ ' ' }}
				<code>2000×500</code>
				{{ ' ' }}
				{{ $gettext(`(ratio of 4 ÷ 1).`) }}
			</p>
			<p class="help-block">
				<AppLinkHelp page="dev-page-headers" class="link-help">
					{{ $gettext(`What are the header requirements and guidelines?`) }}
				</AppLinkHelp>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minWidth, height: minHeight }),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="headerSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`header`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="form.formModel.header && !form.formModel.file"
			name="header_crop"
			:label="$gettext(`Crop Current Header`)"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="form.formModel.header.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="minAspectRatio"
					:max-aspect-ratio="maxAspectRatio"
				/>

				<AppFormControlErrors />
			</div>
		</AppFormGroup>

		<template v-if="form.formModel.header">
			<AppFormButton>
				{{ $gettext(`Save`) }}
			</AppFormButton>
			<AppButton trans @click="clearHeader()">
				{{ $gettext(`Remove Header`) }}
			</AppButton>
		</template>
	</AppForm>
</template>
