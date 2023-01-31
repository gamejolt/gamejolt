<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue';
import { illNoCommentsSmall } from '../../../../app/img/ill/illustrations';
import {
	styleBorderRadiusBase,
	styleBorderRadiusCircle,
	styleBorderRadiusLg,
} from '../../../../_styles/mixins';
import {
	kBorderRadiusLg,
	kBorderWidthLg,
	kFontSizeSmall,
	kStrongEaseOut,
} from '../../../../_styles/variables';
import { Api } from '../../../api/api.service';
import AppAspectRatio from '../../../aspect-ratio/AppAspectRatio.vue';
import AppAvatarFrame from '../../../avatar/AppAvatarFrame.vue';
import { shorthandReadableTime } from '../../../filters/duration';
import AppForm, { createForm, FormController } from '../../../form-vue/AppForm.vue';
import AppFormButton from '../../../form-vue/AppFormButton.vue';
import AppFormStickySubmit from '../../../form-vue/AppFormStickySubmit.vue';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppIllustration from '../../../illustration/AppIllustration.vue';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { useCommonStore } from '../../../store/common-store';
import {
	kThemeBgOffset,
	kThemeBgSubtle,
	kThemeDark,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '../../../theme/variables';
import { $gettext } from '../../../translate/translate.service';
import AppUserAvatarImg from '../AppUserAvatarImg.vue';
import { UserAvatarFrame } from './frame.model';

interface FormModel {
	avatar_frame: number | undefined;
}

const { user } = useCommonStore();

const placeholderFrames = [null, null];

const expiryInfoKey = ref(-1);
const availableFrames = ref<UserAvatarFrame[]>([]);

const displayFrames = computed(() =>
	availableFrames.value.length ? [null, ...availableFrames.value] : []
);

const myFrameId = computed(() => user.value?.avatar_frame?.id || 0);

const form: FormController<FormModel> = createForm({
	loadUrl: '/web/dash/profile/save',
	onInit() {
		form.formModel.avatar_frame = myFrameId.value;
	},
	onLoad(payload) {
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

const interval = setInterval(() => (expiryInfoKey.value *= -1), 1_000);

onUnmounted(() => {
	clearInterval(interval);
});

function pickFrame(frameId: number) {
	if (!form.isLoaded) {
		return;
	}

	form.formModel.avatar_frame = frameId;
	form.changed = form.formModel.avatar_frame !== myFrameId.value;
}

function isSelected(data: UserAvatarFrame | null) {
	const frameId = data?.avatar_frame.id || 0;
	return frameId === form.formModel.avatar_frame;
}
</script>

<template>
	<AppForm :controller="form">
		<template v-if="form.isLoaded && !displayFrames.length">
			<AppIllustration :asset="illNoCommentsSmall" sm>
				{{ $gettext(`You have no available avatar frames.`) }}
			</AppIllustration>

			<AppSpacer vertical :scale="4" />
		</template>
		<template v-else>
			<div
				:style="{
					display: `grid`,
					gap: `8px`,
					gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
				}"
			>
				<div
					v-for="(data, index) of form.isLoaded ? displayFrames : placeholderFrames"
					:key="data?.avatar_frame.id ?? `no-frame-${index}`"
					:style="[
						form.isLoaded
							? {
									cursor: data?.isExpired ? 'normal' : 'pointer',
									backgroundColor: isSelected(data)
										? kThemeBgOffset
										: `transparent`,
							  }
							: {
									backgroundColor: kThemeBgSubtle,
							  },
						{
							position: `relative`,
							padding: `24px`,
							borderRadius: kBorderRadiusLg.px,
							transition: `background-color 300ms ${kStrongEaseOut}`,
							...styleBorderRadiusLg,
							border: `${kBorderWidthLg.px} solid ${kThemeFg10}`,
						},
					]"
					@click="data?.isExpired ? undefined : pickFrame(data?.avatar_frame.id || 0)"
				>
					<AppAspectRatio
						:style="{
							width: `100%`,
						}"
						:ratio="1"
						show-overflow
					>
						<template v-if="form.isLoaded">
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
						</template>
					</AppAspectRatio>

					<div
						v-if="data && data.expires_on"
						:key="expiryInfoKey"
						:style="{
							position: `absolute`,
							top: `8px`,
							left: `8px`,
							padding: `2px 6px`,
							backgroundColor: `rgba(0, 0, 0, 0.54)`,
							color: data.isExpired ? kThemeGjOverlayNotice : `white`,
							fontWeight: `bold`,
							fontSize: kFontSizeSmall.px,
							...styleBorderRadiusBase,
							zIndex: 3,
							pointerEvents: `none`,
						}"
					>
						{{
							data.isExpired
								? 'Expired'
								: shorthandReadableTime(data.expires_on, {
										allowFuture: true,
										precision: 'rough',
										nowText: 'Expired',
								  })
						}}
					</div>
				</div>
			</div>

			<AppSpacer vertical :scale="8" />

			<AppFormStickySubmit>
				<AppFormButton>
					{{ $gettext(`Save avatar frame`) }}
				</AppFormButton>
			</AppFormStickySubmit>
		</template>
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
