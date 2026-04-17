<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '~common/button/AppButton.vue';
import { CreatorExperienceLevelModel } from '~common/creator/experience/level.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppCircularProgress from '~common/progress/AppCircularProgress.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { sleep } from '~utils/utils';

type Props = {
	level: CreatorExperienceLevelModel;
};
const { level } = defineProps<Props>();

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

						<AppCircularProgress class="absolute inset-0 z-[2]" :percent="percent" />
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
				{{ $gettext(`Level %{ level }`, { level: level.level }) }}
			</div>

			<AppSpacer vertical :scale="4" />

			<div v-if="level.ability_display" class="sheet sans-margin-bottom change-bg-bg-offset">
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
