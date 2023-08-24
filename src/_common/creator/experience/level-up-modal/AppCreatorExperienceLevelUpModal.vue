<script lang="ts" setup>
import { PropType, onMounted, ref } from 'vue';
import { styleAbsoluteFill, styleChangeBg } from '../../../../_styles/mixins';
import { sleep } from '../../../../utils/utils';
import AppAspectRatio from '../../../aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../button/AppButton.vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import AppCircularProgress from '../../../progress/AppCircularProgress.vue';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { useCommonStore } from '../../../store/common-store';
import AppUserAvatarBubble from '../../../user/user-avatar/AppUserAvatarBubble.vue';
import { CreatorExperienceLevelModel } from '../level.model';

defineProps({
	level: {
		type: Object as PropType<CreatorExperienceLevelModel>,
		required: true,
	},
});

const { user: myUser } = useCommonStore();

const modal = useModal()!;

const percent = ref(0);

onMounted(async () => {
	// Wait a tick so our circular progress indicator animates properly.
	await sleep(0);
	percent.value = 1;
});
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title sans-margin-bottom">
				<span>
					{{ $gettext(`Your creator level increased!`) }}
				</span>
			</h2>
		</div>

		<div class="modal-body">
			<div
				:style="{
					display: `flex`,
					justifyContent: `center`,
				}"
			>
				<div
					:style="{
						flex: `auto`,
						maxWidth: `120px`,
					}"
				>
					<AppAspectRatio :ratio="1" show-overflow>
						<AppUserAvatarBubble :user="myUser" disable-link />

						<AppCircularProgress
							:style="styleAbsoluteFill({ zIndex: 2 })"
							:percent="percent"
						/>
					</AppAspectRatio>
				</div>
			</div>

			<AppSpacer vertical :scale="2" />

			<div
				class="text-center anim-fade-in"
				:style="{
					fontWeight: `bold`,
					animationDelay: `300ms`,
				}"
			>
				{{ $gettextInterpolate(`Level %{ level }`, { level: level.level }) }}
			</div>

			<AppSpacer vertical :scale="4" />

			<div
				v-if="level.ability_display"
				class="sheet sans-margin-bottom"
				:style="{
					...styleChangeBg('bg-offset'),
				}"
			>
				<div class="section-header small text-muted">
					{{ $gettext(`Reward`) }}
				</div>

				<div>
					{{ level.ability_display }}
				</div>
			</div>
		</div>
	</AppModal>
</template>
