<script lang="ts" setup>
import { ref } from 'vue';
import { illNoCommentsSmall } from '../../../../app/img/ill/illustrations';
import { Api } from '../../../api/api.service';
import AppForm, { createForm, FormController } from '../../../form-vue/AppForm.vue';
import AppFormButton from '../../../form-vue/AppFormButton.vue';
import AppFormGroup from '../../../form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../form-vue/AppFormStickySubmit.vue';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppIllustration from '../../../illustration/AppIllustration.vue';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { useCommonStore } from '../../../store/common-store';
import { $gettext } from '../../../translate/translate.service';
import { UserAvatarFrame } from './frame.model';
import AppUserAvatarFrameSelector from './_selector/AppUserAvatarFrameSelector.vue';

interface FormModel {
	avatar_frame: number | undefined;
}

const { user } = useCommonStore();

const availableFrames = ref<UserAvatarFrame[]>([]);

const form: FormController<FormModel> = createForm({
	loadUrl: '/web/dash/profile/save',
	onLoad(payload) {
		availableFrames.value = UserAvatarFrame.populate(payload.userAvatarFrames);

		form.formModel.avatar_frame =
			availableFrames.value.find(i => i.is_active)?.avatar_frame.id || 0;
	},
	async onSubmit() {
		return Api.sendRequest(`/web/dash/profile/save`, {
			...form.formModel,
		});
	},
	onSubmitError() {
		showErrorGrowl($gettext(`Something went wrong. Try again later.`));
	},
	onSubmitSuccess(response) {
		user.value?.processUpdate(response, 'user');
	},
});
</script>

<template>
	<!-- FormUserAvatarFrame -->
	<AppForm :controller="form">
		<AppFormGroup
			:style="{
				marginBottom: 0,
			}"
			name="avatar_frame"
			hide-label
		>
			<AppUserAvatarFrameSelector :frames="availableFrames">
				<template #no-items>
					<AppIllustration :asset="illNoCommentsSmall" sm>
						{{ $gettext(`You have no available avatar frames.`) }}
					</AppIllustration>
				</template>
			</AppUserAvatarFrameSelector>

			<AppSpacer vertical :scale="8" />

			<AppFormStickySubmit>
				<AppFormButton>
					{{ $gettext(`Save avatar frame`) }}
				</AppFormButton>
			</AppFormStickySubmit>
		</AppFormGroup>
	</AppForm>
</template>
