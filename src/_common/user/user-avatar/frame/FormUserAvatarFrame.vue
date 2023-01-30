<script lang="ts" setup>
import { computed, ref } from 'vue';
import { styleBorderRadiusCircle, styleBorderRadiusLg } from '../../../../_styles/mixins';
import { kBorderRadiusLg, kBorderWidthLg, kFontSizeSmall } from '../../../../_styles/variables';
import { Api } from '../../../api/api.service';
import AppAspectRatio from '../../../aspect-ratio/AppAspectRatio.vue';
import AppAvatarFrame from '../../../avatar/AppAvatarFrame.vue';
import AppForm, { createForm, FormController } from '../../../form-vue/AppForm.vue';
import AppFormButton from '../../../form-vue/AppFormButton.vue';
import AppFormStickySubmit from '../../../form-vue/AppFormStickySubmit.vue';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { useCommonStore } from '../../../store/common-store';
import { kThemeBgOffset, kThemeDark, kThemeFg10 } from '../../../theme/variables';
import { $gettext } from '../../../translate/translate.service';
import AppUserAvatarImg from '../AppUserAvatarImg.vue';
import { UserAvatarFrame } from './frame.model';

interface FormModel {
	avatar_frame: number | undefined;
}

const { user } = useCommonStore();

const availableFrames = ref<UserAvatarFrame[]>([]);
const displayFrames = computed(() => [null, ...availableFrames.value]);

const form: FormController<FormModel> = createForm({
	loadUrl: '/web/dash/profile/save',
	onInit() {
		form.formModel.avatar_frame = user.value?.avatar_frame?.id;
	},
	onLoad(payload) {
		// TODO(avatar-frames) paginate if required
		availableFrames.value = UserAvatarFrame.populate(payload.userAvatarFrames);
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

function pickFrame(frameId: number | undefined) {
	form.formModel.avatar_frame = frameId;
	form.changed = form.formModel.avatar_frame !== user.value?.avatar_frame?.id;
}

function isSelected(data: UserAvatarFrame | null) {
	return data?.avatar_frame.id === form.formModel.avatar_frame;
}
</script>

<template>
	<AppForm :controller="form">
		<div
			:style="{
				display: `grid`,
				gap: `8px`,
				gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
			}"
		>
			<!-- TODO(avatar-frames) no-items state, placeholders -->
			<div
				v-for="data of displayFrames"
				:key="data?.avatar_frame?.id ?? 'no-frame'"
				:style="{
					padding: `24px`,
					cursor: 'pointer',
					backgroundColor: isSelected(data) ? kThemeBgOffset : `transparent`,
					borderRadius: kBorderRadiusLg.px,
					// TODO(avatar-frames) add consts for our curve variables
					transition: `background-color 300ms cubic-bezier(0.19, 1, 0.2, 1)`,
					...styleBorderRadiusLg,
					border: `${kBorderWidthLg.px} solid ${kThemeFg10}`,
				}"
				@click="pickFrame(data?.avatar_frame?.id)"
			>
				<AppAspectRatio
					:style="{
						width: `100%`,
					}"
					:ratio="1"
					show-overflow
				>
					<!-- TODO(avatar-frames) expiry info -->
					<div
						:style="{
							position: `absolute`,
							left: 0,
							top: 0,
							right: 0,
							bottom: 0,
							display: `grid`,
							alignItems: `center`,
						}"
					>
						<div
							v-if="!data"
							:style="{
								textAlign: `center`,
								fontWeight: `bold`,
								fontSize: kFontSizeSmall.px,
							}"
						>
							{{ $gettext(`No frame`) }}
						</div>
						<AppAvatarFrame v-else :frame="data.avatar_frame">
							<AppAspectRatio :ratio="1">
								<Transition name="fade">
									<AppUserAvatarImg
										v-if="isSelected(data)"
										:style="{
											backgroundColor: kThemeDark,
											...styleBorderRadiusCircle,
										}"
										:user="user"
									/>
								</Transition>
							</AppAspectRatio>
						</AppAvatarFrame>
					</div>
				</AppAspectRatio>
			</div>
		</div>

		<AppSpacer vertical :scale="4" />

		<AppFormStickySubmit>
			<AppFormButton>
				{{ $gettext(`Save avatar frame`) }}
			</AppFormButton>
		</AppFormStickySubmit>
	</AppForm>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out

.fade-enter-from
.fade-leave-to
	opacity: 0
</style>
