<script lang="ts" setup>
import { computed, ref, toRef, watch } from 'vue';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppForm, { createForm } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlCrop from '~common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '~common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
	validateImageMinDimensions,
} from '~common/form-vue/validators';
import AppLinkExternal from '~common/link/AppLinkExternal.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';
import { $clearUserAvatar, $saveUserAvatar, UserModel } from '~common/user/user.model';

type FormModel = UserModel & {
	avatar_crop?: any;
	crop?: any;
};

type Props = {
	model?: FormModel;
};
const { model } = defineProps<Props>();

const maxFilesize = ref(0);
const minSize = ref(0);
const maxSize = ref(0);

const form = createForm<FormModel>({
	model: toRef(() => model),
	modelClass: UserModel,
	modelSaveHandler: $saveUserAvatar,
	warnOnDiscard: false,
	reloadOnSubmit: true,
	loadUrl: '/web/dash/avatar/save',
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		minSize.value = payload.minSize;
		maxSize.value = payload.maxSize;
	},
	onBeforeSubmit() {
		form.formModel.crop = form.formModel.avatar_crop;
	},
});

const crop = computed(() =>
	form.formModel.avatar_media_item ? form.formModel.avatar_media_item.getCrop() : undefined
);

watch(crop, () => {
	form.formModel.avatar_crop = crop.value;
});

function avatarSelected() {
	if (form.formModel.file) {
		form.submit();
	}
}

async function clearAvatar() {
	const result = await showModalConfirm(`Are you sure you want to remove your avatar?`);

	if (result) {
		$clearUserAvatar(form.formModel);
	}
}

function gravatarToggled() {
	Api.sendRequest('/web/dash/avatar/gravatar', form.formModel);
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="file" :label="$gettext(`Upload New Avatar`)" :optional="true">
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>
			<p v-translate="{ dimensions: '1000×1000' }" class="help-block strong">
				The recommended size for an avatar is
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
				@changed="avatarSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`avatar`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="form.formModel.avatar_media_item && !form.formModel.file"
			name="avatar_crop"
			:label="$gettext('Your Uploaded Avatar')"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="form.formModel.avatar_media_item.img_url"
					:aspect-ratio="1"
					:min-width="minSize"
					:min-height="minSize"
					:max-width="maxSize"
					:max-height="maxSize"
				/>

				<AppFormControlErrors :label="$gettext('crop')" />
			</div>
		</AppFormGroup>

		<template v-if="form.formModel.avatar_media_item && form.valid">
			<div>
				<AppFormButton>
					<AppTranslate>Save</AppTranslate>
				</AppFormButton>

				<AppButton trans @click="clearAvatar()">
					<AppTranslate>Remove Avatar</AppTranslate>
				</AppButton>
			</div>

			<br />
			<br />
		</template>

		<AppFormGroup name="disable_gravatar" :label="$gettext(`Disable Gravatar?`)">
			<template #inline-control>
				<AppFormControlToggle @changed="gravatarToggled()" />
			</template>

			<p class="help-block">
				<AppTranslate>
					By default we fallback to using Gravatar if you have one. If you would like to
					disable the Gravatar fallback, you can toggle this on.
				</AppTranslate>
				{{ ' ' }}
				<AppLinkExternal href="https://gravatar.com" class="link-help">
					<AppTranslate>What is Gravatar?</AppTranslate>
				</AppLinkExternal>
			</p>
		</AppFormGroup>
	</AppForm>
</template>
