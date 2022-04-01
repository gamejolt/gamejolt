<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../button/AppButton.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppModal from '../modal/AppModal.vue';
import { useModal } from '../modal/modal.service';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { Quest } from './quest-model';
import { QuestReward } from './quest-reward';

defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
	rewards: {
		type: Array as PropType<QuestReward[]>,
		required: true,
	},
	title: {
		type: String,
		default: undefined,
	},
});

const modal = useModal<boolean>()!;
</script>

<template>
	<AppModal class="-quest-rewards-modal anim-fade-in">
		<!-- TODO(quests) remove modal controls after testing -->
		<div class="modal-controls" style="z-index: 1; position: relative">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="-quest-container">
			<div class="-quest-title -center-col anim-fade-in-down anim-fade-in-enlarge">
				<div class="-spacer" />
				<template v-if="!!title">
					<span>
						-
						<AppTranslate>{{ 'QUEST STARTED' }}</AppTranslate>
						-
					</span>

					<span class="-quest-title-header">
						{{ title }}
					</span>
				</template>

				<AppSpacer vertical :scale="2" />

				<template v-if="rewards.length > 0">
					<span>
						-
						<AppTranslate>{{ 'YOUR REWARDS' }}</AppTranslate>
						-
					</span>

					<div v-for="(reward, i) of rewards" :key="i" class="-quest-title-header">
						<!-- TODO(quests) don't show the 'x' for exp rewards -->
						{{ reward.amount + 'x ' }}

						<template v-if="reward.img_url">
							<img :src="reward.img_url" />
						</template>
						<AppJolticon v-else icon="other-os" />

						<span>{{ ' ' + reward.name }}</span>
					</div>
				</template>
			</div>

			<!-- TODO(quests) reward animations -->
			<div v-if="rewards.length > 0" class="-backpack"></div>
			<div v-else class="-avatar"></div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-quest-rewards-modal
	background-color: rgba(black, 0.87)
	animation-duration: 250ms

	::v-deep(.modal)
		background-color: transparent !important

.-quest-container
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	color: white
	&
	& *
		overlay-text-shadow()

.-center-col
	display: flex
	flex-direction: column
	align-items: center

.-spacer
	flex: 0 1 ($shell-top-nav-height + 40px)

.-quest-title
	font-size: calc(min(16px, 1.5vh))

.-quest-title-header
	font-size: calc(min(32px, 3vh))
	font-family: 'Germania'

	img
		height: calc(min(32px, 3vh))
		width: @height
</style>
