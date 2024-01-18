<script lang="ts" setup>
import { ref } from 'vue';
import AppAlertBox from '../../../alert/AppAlertBox.vue';
import { Api } from '../../../api/api.service';
import AppForm, { createForm, FormController } from '../../../form-vue/AppForm.vue';
import AppFormButton from '../../../form-vue/AppFormButton.vue';
import AppFormGroup from '../../../form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../form-vue/AppFormStickySubmit.vue';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppIllustration from '../../../illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '../../../illustration/illustrations';
import { storeModelList } from '../../../model/model-store.service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { useCommonStore } from '../../../store/common-store';
import { $gettext } from '../../../translate/translate.service';
import AppUserAvatarFrameSelector from './_selector/AppUserAvatarFrameSelector.vue';
import { UserAvatarFrameModel } from './frame.model';

interface FormModel {
	avatar_frame: number | 'random' | undefined;
}

const { user } = useCommonStore();

const availableFrames = ref<UserAvatarFrameModel[]>([]);

const form: FormController<FormModel> = createForm({
	loadUrl: '/web/dash/profile/save',
	onLoad(payload) {
		availableFrames.value = storeModelList(UserAvatarFrameModel, payload.userAvatarFrames);

		form.formModel.avatar_frame = user.value?.randomize_avatar_frame
			? 'random'
			: availableFrames.value.find(i => i.is_active)?.avatar_frame.id || 0;
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
			<AppAlertBox
				v-if="user?.is_spawnday"
				icon="info-circle"
				:style="{ marginBottom: '16px' }"
			>
				{{
					$gettext(
						`It's your spawnday! Congrats! Your spawnday frame is being proudly displayed for the entire day.`
					)
				}}
			</AppAlertBox>

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
