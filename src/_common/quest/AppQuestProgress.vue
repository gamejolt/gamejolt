<script lang="ts" setup>
import { computed } from 'vue';

import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import AppProgressBar from '../progress/AppProgressBar.vue';
import AppSpacer from '../spacer/AppSpacer.vue';

type Props = {
	progress: number;
	maxProgressTicks: number;
	showEndDisplay?: boolean;
	icon?: Jolticon;
	isPercent?: boolean;
	isSegmented?: boolean;
};
const { progress, maxProgressTicks, isSegmented } = defineProps<Props>();

const percent = computed(() => Math.round((progress / maxProgressTicks) * 100));
const barCount = computed(() => (isSegmented ? maxProgressTicks : 1));
</script>

<template>
	<div class="-bar-container">
		<template v-for="i of barCount" :key="i">
			<AppProgressBar
				class="-bar"
				:percent="isPercent ? percent : i <= progress ? 100 : 0"
				:glow="isPercent || i <= progress"
				thin
				hide-zero
				bg-subtle
				primary
			/>
			<AppSpacer v-if="i < barCount" horizontal :scale="1" />
		</template>

		<template v-if="showEndDisplay">
			<AppSpacer horizontal :scale="2" />

			<span class="-end" :class="{ '-icon': !!icon }">
				<AppJolticon v-if="!!icon" :icon="icon" />
				<template v-else-if="isPercent"> {{ percent }}% </template>
				<template v-else-if="isSegmented">
					{{ progress + ' / ' + maxProgressTicks }}
				</template>
			</span>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-bar-container
	display: flex
	align-items: center

.-bar
	flex: auto
	margin: 0 !important

.-end
	font-weight: bold
	color: var(--theme-fg-muted)
	white-space: nowrap

	&
	.jolticon
		font-size: $font-size-tiny

	.jolticon
		vertical-align: middle

	&.-icon
		color: var(--theme-link)
		text-shadow: var(--theme-link) 0 0 4px
</style>
