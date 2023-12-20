<script lang="ts" setup>
import { ref, toRef, watch } from 'vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import {
	$clearCommunityChannelBackground,
	$saveCommunityChannelBackground,
	CommunityChannelModel,
} from '../../../../../../_common/community/channel/channel.model';
import AppForm, {
	FormController,
	createForm,
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

type FormModel = CommunityChannelModel & {
	background_crop?: any;
};

const maxFilesize = ref(0);
const aspectRatio = ref(0);
const minWidth = ref(0);
const minHeight = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const crop = toRef(() => {
	return form.formModel.background ? form.formModel.background.getCrop() : undefined;
});

watch(crop, () => {
	form.formModel.background_crop = crop.value;
});

const form: FormController<FormModel> = createForm({
	modelClass: CommunityChannelModel,
	modelSaveHandler: $saveCommunityChannelBackground,
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		aspectRatio.value = payload.aspectRatio;
		minWidth.value = payload.minWidth;
		minHeight.value = payload.minHeight;
		maxWidth.value = payload.maxWidth;
		maxHeight.value = payload.maxHeight;
	},
	onBeforeSubmit() {
		// Backend expects this field.
		// TODO(component-setup-refactor-form-0): Is this okay? no field named 'crop' in FormModel,
		// if backend expects this field, why not add it to FormModel?
		(form.formModel as any).crop = form.formModel.background_crop;
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

	const payload = await $clearCommunityChannelBackground(form.formModel);

	form.formModel?.assign(payload.channel);
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="
				!form.formModel.background
					? $gettext('Upload Channel Background Image')
					: $gettext('Change Channel Background Image')
			"
			:optional="!!form.formModel.background"
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
				<strong>{{
					$gettext(`PNGs are highly recommended as they produce a lossless image.`)
				}}</strong>
			</p>

			<!--TODO(component-setup-refactor-form-0): how to convert the content of v-translate-->
			<p
				v-translate="{
					dimensions: maxWidth + '×' + maxHeight,
					ratio: aspectRatio + ' ÷ 1',
				}"
				class="help-block"
			>
				The recommended size for a channel image is <code>760x200</code> (ratio of
				<strong>%{ratio}</strong>).
				<br />
				Your channel image must be smaller than
				<code>%{dimensions}</code>.
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
			v-if="form.formModel.background && !form.formModel.file"
			name="background_crop"
			:label="$gettext(`Crop Current Background`)"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="form.formModel.background.img_url"
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

		<template v-if="form.formModel.background">
			<AppFormButton>
				{{ $gettext(`Save`) }}
			</AppFormButton>
			<AppButton trans @click="clearBackground()">
				{{ $gettext(`Remove Background`) }}
			</AppButton>
		</template>
	</AppForm>
</template>
