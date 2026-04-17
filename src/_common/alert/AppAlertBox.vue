<script lang="ts" setup>
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { kThemeFgMuted, kThemePrimary } from '~common/theme/variables';
import { kFontSizeSmall } from '~styles/variables';

type Props = {
	icon?: Jolticon;
	color?: 'default' | 'primary';
	fillColor?: 'backdrop' | 'offset' | 'bg';
};
const { icon, color = 'default', fillColor = 'backdrop' } = defineProps<Props>();
</script>

<template>
	<div
		class="flex flex-row items-center rounded p-[24px] [grid-gap:16px]"
		:class="`fill-${fillColor}`"
	>
		<div
			v-if="icon"
			:style="{
				color: color === 'primary' ? kThemePrimary : kThemeFgMuted,
			}"
		>
			<AppJolticon class="text-[24px]" :icon="icon" middle />
		</div>
		<div :style="{ fontSize: kFontSizeSmall.px }">
			<slot />
		</div>
	</div>
</template>
