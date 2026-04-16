<script lang="ts" setup>
import { computed, ref, toRef, watch } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import {
	$clearCommunityCompetitionHeader,
	$saveCommunityCompetitionHeader,
	CommunityCompetitionModel,
} from '~common/community/competition/competition.model';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlCrop from '~common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '~common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
	validateImageMinDimensions,
} from '~common/form-vue/validators';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';

type FormModel = CommunityCompetitionModel & {
	header_crop?: any;
};

type Props = {
	model?: CommunityCompetitionModel;
};
const { model } = defineProps<Props>();

const emit = defineEmits<{
	submit: [competition: CommunityCompetitionModel];
}>();

const maxFilesize = ref(0);
const minAspectRatio = ref(0);
const maxAspectRatio = ref(0);
const minWidth = ref(0);
const minHeight = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const crop = computed(() => (form.formModel.header ? form.formModel.header.getCrop() : undefined));

const form: FormController<FormModel> = createForm({
	modelClass: CommunityCompetitionModel,
	modelSaveHandler: $saveCommunityCompetitionHeader,
	model: toRef(() => model),
	loadUrl: computed(() => `/web/dash/communities/competitions/header/save/${model!.id}`),
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
		// Backend expects this field.
		(form.formModel as any).crop = form.formModel.header_crop;
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

watch(crop, () => {
	form.formModel.header_crop = crop.value;
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
		model?.assign(payload.competition);
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
				<AppTranslate>
					Headers are the big, banner-like images that adorn the tops of pages. For your
					header to look its best on all devices, make sure anything important is located
					near the center of the image.
				</AppTranslate>
			</p>
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>
			<p v-translate="{ dimensions: '2000×500' }" class="help-block strong">
				The recommended size for a header image is
				<code>%{dimensions}</code>
				(ratio of 4 ÷ 1).
			</p>
			<p class="help-block">
				<AppLinkHelp page="dev-page-headers" class="link-help">
					<AppTranslate>What are the header requirements and guidelines?</AppTranslate>
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
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
			<AppButton trans @click="clearHeader()">
				<AppTranslate>Remove Header</AppTranslate>
			</AppButton>
		</template>
	</AppForm>
</template>
