<script lang="ts" setup>
import { PropType } from 'vue';
import { styleBorderRadiusBase, styleWhen } from '../../_styles/mixins';
import { kFontSizeSmall } from '../../_styles/variables';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import { kThemeFgMuted, kThemePrimary } from '../theme/variables';

defineProps({
	icon: {
		type: String as PropType<Jolticon>,
		default: undefined,
	},
	color: {
		type: String as PropType<'default' | 'primary'>,
		default: 'default',
	},
	fillColor: {
		type: String as PropType<'backdrop' | 'offset' | 'bg'>,
		default: 'backdrop',
	},
});
</script>

<template>
	<div
		:class="`fill-${fillColor}`"
		:style="[
			styleBorderRadiusBase,
			{
				display: `flex`,
				flexDirection: `row`,
				alignItems: `center`,
				padding: `24px`,
				gridGap: `16px`,
			},
		]"
	>
		<div
			v-if="icon"
			:style="[
				styleWhen(color === 'default', {
					color: kThemeFgMuted,
				}),
				styleWhen(color === 'primary', {
					color: kThemePrimary,
				}),
			]"
		>
			<AppJolticon :icon="icon" :style="{ fontSize: `24px` }" />
		</div>
		<div :style="{ fontSize: kFontSizeSmall.px }">
			<slot />
		</div>
	</div>
</template>
