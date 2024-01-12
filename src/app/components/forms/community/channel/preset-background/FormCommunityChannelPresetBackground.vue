<script lang="ts" setup>
import { computed, PropType, ref, toRefs, watchEffect } from 'vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import {
	$clearCommunityPresetChannelBackground,
	$saveCommunityPresetChannelBackground,
	CommunityModel,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '../../../../../../_common/community/community.model';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlCrop from '../../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
} from '../../../../../../_common/form-vue/validators';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { $gettext } from '../../../../../../_common/translate/translate.service';

type FormModel = CommunityModel & {
	background_crop?: any;
	crop?: any;
};

const props = defineProps({
	presetType: {
		type: String as PropType<CommunityPresetChannelType>,
		required: true,
	},
	...defineFormProps<CommunityModel>(true),
});

const emit = defineEmits({
	submit: () => true,
});

const { model, presetType } = toRefs(props);

const maxFilesize = ref(0);
const aspectRatio = ref(0);
const minWidth = ref(0);
const minHeight = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const background = computed(() => getCommunityChannelBackground(form.formModel, presetType.value));

const crop = computed(() => background.value?.getCrop());

watchEffect(() => {
	form.formModel.background_crop = crop.value;
});

const form: FormController<FormModel> = createForm({
	model,
	modelClass: CommunityModel,
	loadUrl: computed(
		() => `/web/dash/communities/channels/save-preset-background/${model.value.id}`
	),
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		aspectRatio.value = payload.aspectRatio;
		minWidth.value = payload.minWidth;
		maxWidth.value = payload.maxWidth;
		minHeight.value = payload.minHeight;
		maxHeight.value = payload.maxHeight;
	},
	onBeforeSubmit() {
		form.formModel.crop = form.formModel.background_crop;
	},
	async onSubmit() {
		const response = await $saveCommunityPresetChannelBackground(
			form.formModel,
			presetType.value
		);

		if (model.value) {
			Object.assign(model.value, form.formModel);
		}

		return response;
	},
	onSubmitSuccess() {
		emit('submit');
	},
});

function backgroundSelected() {
	if (form.formModel.file) {
		form.submit();
	}
}

async function clearBackground() {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to remove this channel's background?`)
	);

	if (!result) {
		return;
	}

	const payload = await $clearCommunityPresetChannelBackground(form.formModel, presetType.value);

	model.value?.assign(payload.community);
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="
				!background
					? $gettext('Upload Channel Background Image')
					: $gettext('Change Channel Background Image')
			"
			:optional="!!background"
		>
			<p class="help-block">
				{{
					$gettext(
						`Channel images are backgrounds for your community channels. They give a viewer an easy way to identify what kind of content can be found in the channel. Text can be overlayed, so make sure no important information is on this image.`
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
			<p class="help-block">
				{{ $gettext(`The recommended size for a channel image is`) }}
				{{ ' ' }}
				<code>760x200</code>
				{{ ' ' }}
				{{ '(' + $gettext(`ratio of`) }}
				{{ ' ' }}
				<strong> {{ aspectRatio + ' ÷ 1' }}</strong>
				{{ ').' }}
				<br />
				{{ $gettext(`Your channel image must be smaller than`) }}
				{{ ' ' }}
				<code>{{ maxWidth + '×' + maxHeight }}</code>
				{{ '.' }}
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="backgroundSelected()"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			v-if="background && !form.formModel.file"
			name="background_crop"
			:label="$gettext(`Crop Current Background`)"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="background.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="aspectRatio"
					:max-aspect-ratio="aspectRatio"
				/>

				<AppFormControlErrors />
			</div>
		</AppFormGroup>

		<template v-if="background">
			<AppFormButton>
				{{ $gettext(`Save`) }}
			</AppFormButton>
			<AppButton trans @click="clearBackground()">
				{{ $gettext(`Remove Background`) }}
			</AppButton>
		</template>
	</AppForm>
</template>
