<script lang="ts" setup>
import { computed } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppOnHover from '~common/on/AppOnHover.vue';
import { kThemeBg, kThemeBiBg, kThemeBiFg, kThemeFg } from '~common/theme/variables';
import { styleBorderRadiusLg, styleWhen } from '~styles/mixins';
import { kFontSizeLarge } from '~styles/variables';

type Props = {
	icon: Jolticon;
	to?: RouteLocationRaw;
};
const { icon, to } = defineProps<Props>();

const ourTag = computed(() => (to ? RouterLink : 'div'));
</script>

<template>
	<AppOnHover v-slot="{ hoverBinding, hovered }">
		<component
			:is="ourTag"
			class="elevate-1"
			v-bind="{
				...hoverBinding,
				style: [
					styleBorderRadiusLg,
					{
						display: `flex`,
						flexDirection: `column`,
						height: `150px`,
						padding: `16px`,
						backgroundColor: kThemeBg,
						color: kThemeFg,
						transition: 'background-color 0.1s ease, color 0.1s ease',
					},
					styleWhen(hovered, {
						backgroundColor: kThemeBiBg,
						color: kThemeBiFg,
					}),
				],
			}"
			:to="to"
		>
			<div
				:style="{
					fontWeight: `bold`,
					fontSize: kFontSizeLarge.px,
				}"
			>
				<slot />
			</div>
			<div :style="{ flex: `auto` }" />
			<AppJolticon :style="{ fontSize: `40px` }" :icon="icon" />
		</component>
	</AppOnHover>
</template>
