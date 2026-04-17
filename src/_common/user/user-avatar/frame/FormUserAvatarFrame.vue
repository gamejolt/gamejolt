<script lang="ts" setup>
import { ref } from 'vue';

import AppAlertBox from '~common/alert/AppAlertBox.vue';
import { Api } from '~common/api/api.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '~common/form-vue/AppFormStickySubmit.vue';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '~common/illustration/illustrations';
import { storeModelList } from '~common/model/model-store.service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import AppUserAvatarFrameSelector from '~common/user/user-avatar/frame/_selector/AppUserAvatarFrameSelector.vue';
import { UserAvatarFrameModel } from '~common/user/user-avatar/frame/frame.model';

type FormModel = {
	avatar_frame: number | undefined;
};

const { user } = useCommonStore();

const availableFrames = ref<UserAvatarFrameModel[]>([]);

const form: FormController<FormModel> = createForm<FormModel>({
	loadUrl: '/web/dash/profile/save',
	onLoad(payload) {
		availableFrames.value = storeModelList(UserAvatarFrameModel, payload.userAvatarFrames);

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
			<AppAlertBox v-if="user?.is_spawnday" class="mb-[16px]" icon="info-circle">
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
