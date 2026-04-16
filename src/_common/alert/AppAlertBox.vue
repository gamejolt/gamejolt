<script lang="ts" setup>
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { kThemeFgMuted, kThemePrimary } from '~common/theme/variables';
import { styleBorderRadiusBase, styleWhen } from '~styles/mixins';
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
		:class="`fill-${fillColor}`"
		:style="{
			...styleBorderRadiusBase,
			display: `flex`,
			flexDirection: `row`,
			alignItems: `center`,
			padding: `24px`,
			gridGap: `16px`,
		}"
	>
		<div
			v-if="icon"
			:style="{
				...styleWhen(color === 'default', {
					color: kThemeFgMuted,
				}),
				...styleWhen(color === 'primary', {
					color: kThemePrimary,
				}),
			}"
		>
			<AppJolticon :icon="icon" middle :style="{ fontSize: `24px` }" />
		</div>
		<div :style="{ fontSize: kFontSizeSmall.px }">
			<slot />
		</div>
	</div>
</template>
