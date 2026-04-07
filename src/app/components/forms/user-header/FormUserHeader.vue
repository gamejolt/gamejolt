<script lang="ts" setup>
import { computed, PropType, ref, toRef, watch } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlCrop from '../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
	validateImageMinDimensions,
} from '../../../../_common/form-vue/validators';
import AppLinkHelp from '../../../../_common/link/AppLinkHelp.vue';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { $clearUserHeader, $saveUserHeader, UserModel } from '../../../../_common/user/user.model';

type FormModel = UserModel & {
	header_crop?: any;
};

const props = defineProps({
	model: {
		type: Object as PropType<UserModel>,
		default: undefined,
	},
});

const commonStore = useCommonStore();

const maxFilesize = ref(0);
const minAspectRatio = ref(0);
const maxAspectRatio = ref(0);
const minWidth = ref(0);
const minHeight = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const crop = computed(() =>
	form.formModel.header_media_item ? form.formModel.header_media_item.getCrop() : undefined
);

const form: FormController<FormModel> = createForm({
	modelClass: UserModel,
	modelSaveHandler: $saveUserHeader,
	model: toRef(props, 'model'),
	loadUrl: `/web/dash/header/save`,
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
});

watch(crop, () => {
	form.formModel.header_crop = crop.value;
});

function clearHeader() {
	showModalConfirm($gettext(`Are you sure you want to remove your profile header?`)).then(
		result => {
			if (result) {
				$clearUserHeader(form.formModel);
			}
		}
	);
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
			:optional="!!form.formModel.header_media_item"
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
			v-if="form.formModel.header_media_item && !form.formModel.file"
			name="header_crop"
			:label="$gettext(`Crop Current Header`)"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="form.formModel.header_media_item.img_url"
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

		<template v-if="form.formModel.header_media_item">
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
			<AppButton trans @click="clearHeader()">
				<AppTranslate>Remove Header</AppTranslate>
			</AppButton>
		</template>
	</AppForm>
</template>
